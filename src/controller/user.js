const modelUser = require("../model/user");
const modelPets = require("../model/pets");
const { parseJsonBody, validateBodyCredentials } = require("../utils/bodyJSONparse");
const { createPasswordHash } = require("../utils/hashing");
const { createId } = require("../utils/create-id");
const jwt = require("../service/jwt");


exports.getAllUsers = async () => {
  return await modelUser.allUsersModel();
};

exports.addNewUser = async (req, res) => {
  const { password, ...newUserBody } = await parseJsonBody(req);

  validateBodyCredentials({ ...newUserBody, password }, res)

  const passwordHash = await createPasswordHash(password)

  const user = {
    id: createId(),
    ...newUserBody,
  };

  const createResult = await modelUser.createNewUserModel({ ...user, password: passwordHash });
  if (!createResult) {
    res.writeHead(409)
    return {
      error: {
        status: 409,
        message: 'User already exists.'
      }
    }
  }

  return user;
};

exports.loginUser = async (req, res) => {
  const newUserBody = await parseJsonBody(req);
  validateBodyCredentials(newUserBody, res)

  // Найти пользователя с данными логином.
  const user = await modelUser.findUserByLogin(newUserBody.login)
  if (!user) {
    res.writeHead(404)
    return {
      error: {
        status: 404,
        message: 'User not found.'
      }
    }
  }

  const currentHash = await createPasswordHash(newUserBody.password)
  if (user.password !== currentHash) {
    res.writeHead(401)
    return {
      error: {
        status: 401,
        message: 'Unauthorized.'
      }
    }
  }

  return {
    token: jwt.sign({
      sub: user.id,
      roles: user.roles,
    })
  };
}; 

exports.getUserById = async (id, res) => {
  const getAllPets = await modelPets.getAllPetsModel();
  return await modelUser.getUserByIdModel(id, getAllPets);
};

exports.updateUser = async (req) => {
  const updateUserData = await parseJsonBody(req);
  await modelUser.updateUserModel(updateUserData);
  return updateUserData;
};

exports.deleteUser = async (req) => {
  const deleteUserData = await parseJsonBody(req);
  await modelPets.deleteOwnerPet(deleteUserData.id);
  await modelUser.deleteUserModel(deleteUserData);
  return deleteUserData;
};
