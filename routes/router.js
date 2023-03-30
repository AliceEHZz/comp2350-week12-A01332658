const router = require("express").Router();
const database = include("databaseConnection");
const User = include("models/user");
const Pet = include("models/pet");
const Joi = require("joi");

router.get("/", async (req, res) => {
  console.log("home page hit");
  try {
    // The .find() method here has no restrictions, just an empty json object {} so it will return all users in the collection.

    // The .select() specifies a list of the fields to be returned. In this case we want the first_name, last_name, email and id. We call the .exec() method and make sure we await for the promise to complete.
    const result = await User.find({})
      .select("first_name last_name email id")
      .exec();
    console.log("Show all users: ", result);
    res.render("index", { allUsers: result });
  } catch (ex) {
    res.render("error", { message: "Error" });
    console.log("Error");
    console.log(ex);
  }
});

/**
 * This route create a reference to a new Pet object called pet1 whose name is "Fido" and pet2 whose name is "Rex".
 */
router.get("/populateData", async (req, res) => {
  console.log("populate Data");
  try {
    let pet1 = new Pet({
      name: "Fido",
    });
    let pet2 = new Pet({
      name: "Rex",
    });
    // The .save() method is what actually creates the document in the MongoDB database.
    await pet1.save();
    //pet1.id contains the newly created pet's id
    console.log(pet1.id);
    await pet2.save();
    //pet2.id contains the newly created pet's id
    console.log(pet2.id);
    let user = new User({
      first_name: "Me",
      last_name: "Awesome",
      email: "a@b.ca",
      password_hash: "thisisnotreallyahash",
      password_salt: "notagreatsalt",
      pets: [pet1.id, pet2.id],
    });

    //! Don't forget to .save() the user too! Otherwise it won't get sent to the database!
    await user.save();
    //user.id contains the newly created user's id
    console.log(user.id);
    res.redirect("/");
  } catch (ex) {
    res.render("error", { message: "Error" });
    console.log("Error");
    console.log(ex);
  }
});

router.get("/showPets", async (req, res) => {
  console.log("page hit");
  try {
    const schema = Joi.string().max(25).required();
    const validationResult = schema.validate(req.query.id);
    if (validationResult.error != null) {
      console.log(validationResult.error);
      throw validationResult.error;
    }
    const userResult = await User.findOne({ _id: req.query.id })
      .select("first_name id name ")
      .populate("pets")
      .exec();
    console.log("showPets result: ",userResult);
    res.render("pet", { userAndPets: userResult });
  } catch (ex) {
    res.render("error", { message: "Error" });
    console.log("Error");
    console.log(ex);
  }
});

module.exports = router;
