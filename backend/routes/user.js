const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const POST = mongoose.model("POST");
const USER = mongoose.model("USER");
const requireLogin = require("../middlewares/requireLogin");

// to get user profile
router.get("/user/:id", (req, res) => {
    USER.findOne({ _id: req.params.id })
        .select("-password")
        .then(user => {
            POST.find({ postedBy: req.params.id })
                .populate("postedBy", "_id")
                .exec((err, post) => {
                    if (err) {
                        return res.status(422).json({ error: err })
                    }
                    res.status(200).json({ user, post })
                })
        }).catch(err => {
            return res.status(404).json({ error: "User not found" })
        })
})

// to follow user
router.put("/follow", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        USER.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, {
            new: true
        }).then(result => {
            res.json(result)

        })
            .catch(err => { return res.status(422).json({ error: err }) })
    }
    )
})

// to unfollow user
router.put("/unfollow", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.body.followId, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    }, (err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        USER.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.followId }
        }, {
            new: true
        }).then(result => res.json(result))
            .catch(err => { return res.status(422).json({ error: err }) })
    }
    )
})

// to upload profile pic
router.put("/uploadProfilePic", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.user._id, {
        $set: { Photo: req.body.pic }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: er })
        } else {
            res.json(result)
        }
    })
})

router.put("/uploadSports", requireLogin, (req, res) => {
    USER.findByIdAndUpdate(req.user._id, {
        $set: { Sports: req.body.sports }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({ error: er })
        } else {
            res.json(result)
        }
    })
})

// to update user profile
router.put("/updateuser", requireLogin, (req, res) => {
    const { name, userName, Sports } = req.body;
    
    // Validate input
    if (!name || !userName) {
        return res.status(422).json({ error: "Name and username are required" });
    }
    
    // Check if username is already taken by another user
    USER.findOne({ 
        userName: userName, 
        _id: { $ne: req.user._id } // Exclude current user from check
    })
    .then(existingUser => {
        if (existingUser) {
            return res.status(422).json({ error: "Username already taken" });
        }
        
        // Update user profile
        USER.findByIdAndUpdate(
            req.user._id,
            {
                $set: { 
                    name: name,
                    userName: userName,
                    Sports: Sports || req.user.Sports
                }
            },
            { new: true, select: "-password" } // Return updated document without password
        )
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(updatedUser);
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: "Server error" });
        });
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
    });
});

module.exports = router;
