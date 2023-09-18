import axios from "axios";

export function updateUserInDatabase(user, context, callback) {
  axios
    .post("http://localhost:3001/api/update-user", {
      email: user.email,
      name: user.name,
    })
    .then((response) => {
      callback(null, user, context);
    })
    .catch((error) => {
      callback(error);
    });
}
