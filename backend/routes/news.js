const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const NEWS = mongoose.model("NEWS");
const USER = mongoose.model("USER");

// Get all news matching user's sports preference
router.get("/allnews", requireLogin, (req, res) => {
    // Get the current user's sports preference
    const userSports = req.user.Sports;
    
    // If user has no sports preference, return all news
    if (!userSports) {
        NEWS.find()
            .populate("postedBy", "_id name Photo")
            .sort("-createdAt")
            .then(news => res.json(news))
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: "Failed to fetch news" });
            });
    } else {
        // Find news that matches the user's sports preference or is marked as "General"
        NEWS.find({ $or: [{ Sports: userSports }, { Sports: "General" }] })
            .populate("postedBy", "_id name Photo")
            .sort("-createdAt")
            .then(news => res.json(news))
            .catch(err => {
                console.log(err);
                res.status(500).json({ error: "Failed to fetch news" });
            });
    }
});

// Post news
router.post("/postnews", requireLogin, (req, res) => {
    const { content, sports } = req.body;
    
    if (!content) {
        return res.status(422).json({ error: "Please add news content" });
    }
    
    const news = new NEWS({
        content,
        Sports: sports || req.user.Sports || "General",
        postedBy: req.user
    });
    
    news.save()
        .then((result) => {
            result.populate("postedBy", "_id name Photo")
                .then(populatedNews => {
                    res.json({ news: populatedNews, message: "News posted successfully" });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Failed to post news" });
        });
});

// Delete news
router.delete("/deletenews/:newsId", requireLogin, (req, res) => {
    NEWS.findOne({ _id: req.params.newsId })
        .populate("postedBy", "_id")
        .then((news) => {
            if (!news) {
                return res.status(404).json({ error: "News not found" });
            }
            
            // Check if the user is the one who posted the news
            if (news.postedBy._id.toString() !== req.user._id.toString()) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            
            news.remove()
                .then(deletedNews => {
                    res.json({ message: "News deleted successfully", deletedNews });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: "Failed to delete news" });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Failed to find news" });
        });
});

// Get news by user ID
router.get("/mynews", requireLogin, (req, res) => {
    NEWS.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name Photo")
        .sort("-createdAt")
        .then(news => {
            res.json(news);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Failed to fetch your news" });
        });
});

// Get news by sports category
router.get("/sportsnews/:category", requireLogin, (req, res) => {
    const sportsCategory = req.params.category;
    
    NEWS.find({ Sports: sportsCategory })
        .populate("postedBy", "_id name Photo")
        .sort("-createdAt")
        .then(news => {
            res.json(news);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Failed to fetch sports news" });
        });
});

module.exports = router;

