
//a funcçaõ que vai gerar a hiprigrafia
const {hash} = require("bcryptjs")

const AppError = require("../utils/AppError");

const sqliteConnection = require("../database/sqlite")

//Validando se tem outro email igual registrado
class UsersController{
    async create(req, res){

        const { name,  email, password} = req.body;

        const database = await sqliteConnection()
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(checkUserExists){
          throw new AppError("Este email já está em uso")
        }

        //cripigrafando senha de usúario
        const hashPawword = await hash(password, 8)

        await database.run("INSERT INTO users(name, email, password) VALUES (?, ?, ? )",
        [name, email, hashPawword]
        )

        return res.status(201).json();
  }
  async update(request, response) {
    const { name, email } = request.body;
    const { id } = request.params;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.");
    }

    user.name = name;
    user.email = email;

    await database.run(
      `UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,

      [user.name, user.email, user.password, new Date(), id]
    );
    return response.json();
  } 
}
    
  

module.exports = UsersController;