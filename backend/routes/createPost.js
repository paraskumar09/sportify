const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const { route } = require("./auth");
const POST = mongoose.model("POST")


// Route
router.get("/allposts", requireLogin, (req, res) => {
    POST.find()
        .populate("postedBy", "_id name Photo")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(posts => res.json(posts))
        .catch(err => console.log(err))
})

router.post("/createPost", requireLogin, (req, res) => {
    const { body, sports, pic } = req.body;
    console.log(pic)
    if (!body || !pic) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    console.log(req.user)
    const post = new POST({
        body,
        photo: pic,
        Sports: sports,
        postedBy: req.user
    })
    post.save().then((result) => {
        return res.json({ post: result })
    }).catch(err => console.log(err))
})

router.get("/myposts", requireLogin, (req, res) => {
    POST.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort("-createdAt")
        .then(myposts => {
            res.json(myposts)
        })
})

router.get("/search", requireLogin, (req, res) => {
    const userName = req.query.userName;

   POST.find()
  .populate({
    path: "postedBy",
    match: { name: req.query.userName },  
    select: "_id name"
  })
  .populate("comments.postedBy", "_id name")
  .sort("-createdAt")
  .then(posts => {
    const filtered = posts.filter(post => post.postedBy !== null);
    res.json(filtered);
  });

});


router.put("/like", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    }).populate("postedBy", "_id name Photo")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.put("/unlike", requireLogin, (req, res) => {
    POST.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    }).populate("postedBy", "_id name Photo")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.put("/comment", requireLogin, (req, res) => {
    const comment = {
        comment: req.body.text,
        postedBy: req.user._id
    }
    POST.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name Photo")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

// Api to delete post
router.delete("/deletePost/:postId", requireLogin, (req, res) => {
    POST.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({ error: err })
            }

            if (post.postedBy._id.toString() == req.user._id.toString()) {

                post.remove()
                    .then(result => {
                        return res.json({ message: "Successfully deleted" })
                    }).catch((err) => {
                        console.log(err)
                    })
            }
        })
})

// to show following post
router.get("/myfollwingpost", requireLogin, (req, res) => {
    POST.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(posts => {
            res.json(posts)
        })
        .catch(err => { console.log(err) })
})

// Get posts by sports category
router.get("/sportsposts/:category", requireLogin, (req, res) => {
    const sportsCategory = req.params.category;
    
    // If category is General, return all posts
    if (sportsCategory === "General") {
        POST.find()
            .populate("postedBy", "_id name Photo")
            .populate("comments.postedBy", "_id name")
            .sort("-createdAt")
            .then(posts => {
                res.json(posts);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: "Failed to fetch posts" });
            });
    } else {
        // Find posts that match the specified sports category
        POST.find({ Sports: sportsCategory })
            .populate("postedBy", "_id name Photo")
            .populate("comments.postedBy", "_id name")
            .sort("-createdAt")
            .then(posts => {
                res.json(posts);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: "Failed to fetch posts" });
            });
    }
});

module.exports = router

