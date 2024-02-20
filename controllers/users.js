import User from "../models/User.js";

export function getAll(req, res) {
  User.find({})
    .then((docs) => {
      let Users = [];
      for (let i = 0; i < docs.length; i++) {
        Users.push({
            userID:docs[i].userID,
          firstname: docs[i].firstname,
            lastname: docs[i].lastname,
            username: docs[i].username,
          email: docs[i].email,
          password: docs[i].password,
          phone: docs[i].phone,
          avatar: docs[i].avatar,
          isBanned: docs[i].isBanned,
          role: docs[i].role
        });
      }
      res.status(200).json({Users});
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}
