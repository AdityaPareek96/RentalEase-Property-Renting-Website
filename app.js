if(process.env.NODE_ENV != "production") {
    require("dotenv").config(); // only project level ke liye hi .env file access hogi
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MongoURL = "mongodb://127.0.0.1:27017/wanderlust";
const dbURL = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to DB.");
}).catch((err) => {console.log(err); });

async function main() {
    await mongoose.connect(dbURL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, // in seconds
});

store.on("error", () => {
    console.log("ERROR in Mongo Session Store.", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000 kyuki ye value milliseconds me aati hai (here 1 week time)
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true, // to avoid cross scripting attacks
    },
};

// app.get("/", (req, res) => {
//     res.send("Hii, i am root .., go to /listings to see Listings.");
// });

app.use(session(sessionOptions));
app.use(flash()); // hamesa routes ke phle aayega

app.use(passport.initialize());
app.use(passport.session()); // agar same user hoga (jo ek hi browser se login krega uska) to same session hoga
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// demo user
// app.get("/demoUser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student", // apne aap passport create kr deta hai ye field
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// upr in routes ki baat ho rhi thi
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My Home",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample saved.");
//     res.send("successful testing.");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"));
});

app.use((err, req, res, next) => {
    let {status = 500, message = "Something went Wrong..!!"} = err;
    res.status(status).render("error.ejs", {err});
    // res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080.");
});

