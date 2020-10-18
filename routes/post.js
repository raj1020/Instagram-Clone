const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model("Post");

router.get('/allposts', requireLogin, (req, res) => {

    Post.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy", "_id name")
    .sort('-createdAt')
    .then(posts => {
        res.json({posts})
    })
    .catch(err => {
        console.log(err);
    })

})
router.get('/getsubpost', requireLogin, (req, res) => {

    Post.find({postedBy:{$in: req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy", "_id name")
    .sort('-createdAt')
    .then(posts => {
        res.json({posts})
    })
    .catch(err => {
        console.log(err);
    })

})



router.post('/createpost', requireLogin, (req, res) => {
    const{title, body, pic} = req.body;

    if(!title || !body || !pic) {
        return res.status(422).json({error: "Please add all the fields."})
    }

    req.user.password = undefined;

    const post = new Post ({
        title, // written in leu of title: title
        body, // written in leu of body: body
        photo: pic,  // written in leu of pic: pic
        postedBy: req.user
    })

    post.save().then(result => {
        res.json({post:result})
    })
    .catch(err => {
        console.log(err);
    })

})


router.get('/mypost', requireLogin, (req, res) => {
    Post.find({postedBy: req.user._id})
    .populate("PostedBy", "_id name")
    .then(mypost => {
        res.json({mypost})
    })
    .catch(err =>{
        console.log(err);
    })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {likes:req.user._id}
    }, {
        new: true
    }).exec((err, result) => {
        if(err) {
            return res.status(422).json({error:err})
        } else {
            res.json(result)
            
        }
    })
    
} )



router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {likes:req.user._id}
    }, {
        new: true
    }).exec((err, result) => {
        if(err) {
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
    
} )

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {comments:comment}
    }, {
        new: true
    }).populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
        if(err) {
            return res.status(422).json({error:err})
        } else {
            res.json(result)
            
            
        }
    })
    
} )

router.delete('/deletePost/:postId', requireLogin, (req, res) => {
    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id")
    .exec((err, post) => {
        if(err || !post) {
            return res.status(422).json({error: err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()) {
            post.remove()
            .then(result => {
                res.json(result)
            }).catch(err => {
                console.log(err)
            })
        }
    })
})






router.delete('/deleteComment/:postId/:commentId',requireLogin, (req, res) => {

   
    Post.findOne({_id: req.params.postId})
    .populate("postedBy", "_id name ")
    .populate("comments.postedBy", "_id name")
    .exec((err, post) => {
        
        if(err || !post) {
            return res.status(422).json({ error: err });
        }
        if(post) {

            
            post.comments.forEach(item => { 
                            console.log("item._id.toString()=", item._id.toString())
                
                                if(((item.postedBy._id.toString() === req.user._id.toString()) || (post.postedBy._id.toString()
                                === req.user._id.toString())) && (item._id.toString()===req.params.commentId.toString())) {
                                    
                                
                                   
                                       post.comments.splice(post.comments.indexOf(item),1)
                                       post.save()
                                       .then(result => {
                                        console.log("result: ",result)
                                        res.json((result))
                                    }).catch(err => {
                                        console.log(err)
                                    })
                                      
                            }

                            

        
                        }) 
                        
                    }
                    
                   
                })
});



    
    
    
module.exports = router;
