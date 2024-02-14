import User from "../models/User.js";

export function getAll(req, res) {
  User.find({})
    .then((docs) => {
      let User = [];
      for (let i = 0; i < docs.length; i++) {
        User.push({
          name: docs[i].name,
          email: docs[i].email,
          password: docs[i].password,
          phone: docs[i].phone,
          avatar: docs[i].avatar,
          isBanned: docs[i].isBanned,
          role: docs[i].role
        });
      }
      res.status(200).json({User});
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}