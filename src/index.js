import express from 'express';
import cors from 'cors';
import multer from 'multer';
import _ from 'lodash';
import path from 'path';

import User from './User.model.js';
import Role from './Role.model.js';
import { connectDatabase } from './dbconfig.js';
import { syncModels } from './associations.js';
import UserRole from './UserRole.model.js';
import Post from './Post.model.js';
import Profile from './Profile.model.js';

const app = express();
const storage = multer.memoryStorage();

async function setUpDatabase() {
  await connectDatabase();
  await syncModels();
}

// set up the database
setUpDatabase()
  .then(() => {
    console.log('Database setup complete');
  })
  .catch((error) => {
    console.error('Error setting up the database:', error);
  });

// multer middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf|docx|webp/;
    const mimetypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/vnd',
      'image/webp',
    ];
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = _.includes(mimetypes, file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          'Only images and documents (jpeg, jpg, png, pdf, docx) are allowed!'
        )
      );
    }
  },
});

app.use(express.json());
app.use(cors());

// create a user
app.post('/api/users', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // check if user exists
    let user = await User.findOne({
      where: {
        email,
        isActive: true,
      },
    });
    if (!_.isNil(user)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = await User.create({
      firstname,
      lastname,
      email,
      password,
      isActive: true,
    });
    return res.status(201).json(user);
  } catch (error) {
    console.log('Error creating user', error);
    return res.status(500).json({ message: 'Error creating user' });
  }
});

// get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isActive: true,
      },
      include: {
        model: Role,
        as: 'Roles',
        through: { attributes: [] },
        attributes: ['id', 'name', 'description'],
      },
      attributes: {
        exclude: ['profile', 'password'],
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.log('Error getting users', error);
    return res.status(500).json({ message: 'Error getting users' });
  }
});

// get a user
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }
    const user = await User.findOne(
      {
        where: {
          id,
          isActive: true,
        },
      },
      {
        include: {
          model: Role,
          as: 'Roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'description'],
        },
      }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log('Error getting user', error);
    return res.status(500).json({ message: 'Error getting user' });
  }
});

// update the user
app.put('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // update only sets changed values
    await user.update(req.body);
    return res.status(200).json(user);
  } catch (error) {
    console.log('Error updating user', error);
    return res.status(500).json({ message: 'Error updating user' });
  }
});

// delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const user = await User.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive: false });
    await UserRole.update({ isActive: false }, { where: { userId: id } });
    await Post.destroy({ where: { userId: id } });
    await Profile.update({ isActive: false }, { where: { userId: id } });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.log('Error deleting user', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
});

// create a role
app.post('/api/roles', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // check if role exists
    let role = await Role.findOne({
      where: {
        name,
        isActive: true,
      },
    });
    if (!_.isNil(role)) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    role = await Role.create({ name, description, isActive: true });
    return res.status(201).json(role);
  } catch (error) {
    console.log('Error creating role', error);
    return res.status(500).json({ message: 'Error creating role' });
  }
});

// get all roles
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.findAll({
      where: {
        isActive: true,
      },
      include: {
        model: User,
        as: 'Users',
        through: { attributes: [] },
        attributes: {
          exclude: ['profile', 'password'],
        },
      },
    });
    return res.status(200).json(roles);
  } catch (error) {
    console.log('Error getting roles', error);
    return res.status(500).json({ message: 'Error getting roles' });
  }
});

// get a role
app.get('/api/roles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Role id is required' });
    }
    const role = await Role.findOne(
      {
        where: {
          id,
          isActive: true,
        },
      },
      {
        include: {
          model: User,
          as: 'Users',
          through: { attributes: [] },
          attributes: {
            exclude: ['profile', 'password'],
          },
        },
      }
    );
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    return res.status(200).json(role);
  } catch (error) {
    console.log('Error getting role', error);
    return res.status(500).json({ message: 'Error getting role' });
  }
});

// update the role
app.put('/api/roles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Role id is required' });
    }
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const role = await Role.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    // update only sets changed values
    await role.update(req.body);
    return res.status(200).json(role);
  } catch (error) {
    console.log('Error updating role', error);
    return res.status(500).json({ message: 'Error updating role' });
  }
});

// delete a role
app.delete('/api/roles/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Role id is required' });
    }

    const role = await Role.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // check if users are associated with the role
    const roleUsers = await role.getUsers({
      where: {
        isActive: true,
      },
    });
    if (roleUsers.length) {
      return res.status(400).json({ message: 'Role has associated users' });
    }

    await role.update({ isActive: false });
    await UserRole.update({ isActive: false }, { where: { roleId: id } });

    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.log('Error deleting role', error);
    return res.status(500).json({ message: 'Error deleting role' });
  }
});

// create a post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    if (!title || !content || !userId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({
      where: {
        id: userId,
        isActive: true,
      },
    });
    if (_.isNil(user)) {
      return res.status(404).json({ message: 'User not found' });
    }

    // create a post
    const post = await Post.create({
      title,
      content,
      userId,
    });

    return res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.log('Error creating a post', error);
    return res.status(500).json({ message: 'Error creating a post' });
  }
});

// get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.findAll({
      // include: {
      //   model: User,
      //   attributes: ['id', 'email'],
      // },
    });
    return res.status(200).json(posts);
  } catch (error) {
    console.log('Error fetching all posts', error);
    return res.status(500).json({ message: 'Error fetching all posts' });
  }
});

// get a post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Post id is required' });
    }

    const post = await Post.findOne({
      where: {
        id,
      },
    });
    if (_.isNil(post)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.log('Error getting post', error);
    return res.status(500).json({ message: 'Error getting post' });
  }
});

// update a post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Post id is required' });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const post = await Post.findOne({
      where: {
        id,
      },
    });
    if (_.isNil(post)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.update(req.body);

    return res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.log('Error updating post', error);
    return res.status(500).json({ message: 'Error updating post' });
  }
});

// delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Post id is required' });
    }

    const post = await Post.findOne({
      where: {
        id,
      },
    });
    if (_.isNil(post)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.destroy();

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.log('Error deleting post', error);
    return res.status(500).json({ message: 'Error deleting post' });
  }
});

// get posts of user
app.get('/api/users/:id/posts', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const user = await User.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (_.isNil(user)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await user.getPosts();

    return res.status(200).json(posts);
  } catch (error) {
    console.log('Error getting posts of user', error);
    return res.status(500).json({ message: 'Error getting posts of user' });
  }
});

// get user of post
app.get('/api/posts/:id/user', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Post id is required' });
    }

    const post = await Post.findOne({
      where: {
        id,
      },
    });
    if (_.isNil(post)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await post.getUser();

    return res.status(200).json(user);
  } catch (error) {
    console.log('Error getting user of post', error);
    return res.status(500).json({ message: 'Error getting user of post' });
  }
});

// get user profile
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const id = req.params.id;
    if (_.isNil(id)) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const user = await User.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (_.isNil(user)) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await user.getProfile();

    return res.status(200).json(profile);
  } catch (error) {
    console.log('Error getting user profile', error);
    return res.status(500).json({ message: 'Error getting user profile' });
  }
});

// get user of profile
app.get('/api/profiles/:id/user', async (req, res) => {
  try {
    const id = req.params.id;
    if (_.isNil(id)) {
      return res.status(400).json({ message: 'Profile id is required' });
    }

    const profile = await Profile.findOne({
      where: {
        id,
        isActive: true,
      },
    });
    if (_.isNil(profile)) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const user = await profile.getUser();

    return res.status(200).json(user);
  } catch (error) {
    console.log('Error getting user of profile', error);
    return res.status(500).json({ message: 'Error getting user of profile' });
  }
});

// upload profile picture for a user
app.post(
  '/api/users/:id/profile/upload',
  upload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      if (_.isNil(file)) {
        return res.status(400).json({ message: 'File is required' });
      }
      // check if user exists
      const id = req.params.id;
      if (_.isNil(id)) {
        return res.status(400).json({ message: 'User id is required' });
      }
      let user = await User.findOne({
        where: {
          id,
          isActive: true,
        },
      });
      if (_.isNil(user)) {
        return res.status(404).json({ message: 'User not found' });
      }

      // user found
      user.profile = file.buffer;
      user.profileMimeType = file.mimetype; // Save the MIME type
      await user.save();

      // return user without profile buffer
      user = await User.findOne(
        {
          where: {
            id,
            isActive: true,
          },
        },
        {
          attributes: {
            exclude: ['profile', 'profileMimeType', 'password'],
          },
        }
      );
      return res
        .status(200)
        .json({ message: 'Profile uploaded successfully', user });
    } catch (error) {
      console.log('Error uploading profile picture', error);
      return res
        .status(500)
        .json({ message: 'Error uploading profile picture' });
    }
  }
);

// download user profile
// TODO ? Not Working
app.get('/api/users/:id/profile/download', async (req, res) => {
  try {
    const id = req.params.id;
    if (_.isNil(id)) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const user = await User.findOne({
      where: {
        id,
        isActive: true,
      },
      attributes: ['profile', 'profileMimeType'],
    });
    if (
      _.isNil(user) ||
      _.isNil(user.profile) ||
      _.isNil(user.profileMimeType)
    ) {
      return res
        .status(404)
        .json({ message: 'User or Profile or ProfileMimeType not found' });
    }

    // set the content type based on the profile buffer type (image or document)
    const profile = user.dataValues.profile;
    const mimetype = user.dataValues.profileMimeType;

    res.setHeader('Content-Disposition', 'attachment; filename=profile');
    res.setHeader('Content-Type', mimetype);

    res.send(profile);
  } catch (error) {
    console.log('Error downloading profile picture', error);
    return res
      .status(500)
      .json({ message: 'Error downloading profile picture' });
  }
});

// assign role to a user
app.post('/api/user/:userId/role/:roleId/assign', async (req, res) => {
  try {
    const userId = req.params.userId;
    const roleId = req.params.roleId;

    if (_.isNil(userId) || _.isNil(roleId)) {
      return res
        .status(400)
        .json({ message: 'User and Role ids are required' });
    }

    // find user and role if exists
    let user = await User.findOne({ where: { id: userId, isActive: true } });
    let role = await Role.findOne({ where: { id: roleId, isActive: true } });

    if (_.isNil(user) || _.isNil(role)) {
      return res.status(404).json({ message: 'User or Role not found' });
    }

    // check if user has roles
    const userRole = await user.getRoles({
      where: {
        id: roleId,
        isActive: true,
      },
    });
    if (userRole.length) {
      // check if same role
      const roleIds = _.groupBy(userRole, 'id');
      if (roleIds[roleId]) {
        return res.status(400).json({ message: 'User already has the role' });
      }
    }

    // assign role to user
    await user.addRole(role, { through: { isActive: true } }); // addRole uses bulkCreate internally
    return res.status(200).json({ message: 'Role assigned successfully' });
  } catch (error) {
    console.log('Error in assigning role to user', error);
    return res.status(500).json({ message: 'Error in assigning role to user' });
  }
});

// server listening
app.listen(3000, () => console.log('server started on 3000'));
