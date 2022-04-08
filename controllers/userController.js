const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')


const signToken = (id, username) => {
    return jwt.sign({ id, username }, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRESIN,
        })
}

const register = async (req, res) => {
    const { username, password } = req.body
    try {
        if (username && password) {
            let user = await userModel.findOne({ username })
            if (user) {
                res.status(400).json({
                    status: 'fail',
                    error: `Oops! ${username} already in use`
                })
            }
            else {
                const newUser = await userModel.create({
                    username,
                    password
                })

                let data = {
                    username: newUser.username,
                    id: newUser._id
                }
                res.status(201).json({
                    status: 'success',
                    data
                })

            }
        }
        else {
            res.status(400).json({
                status: 'fail',
                error: 'username and password is required'
            })
        }


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'fail',
            error: 'Something went wrong, please try again'
        })
    }

}



const login = async (req, res) => {
    const { username, password } = req.body
    try {
        if (username && password) {
            let user = await userModel.findOne({ username }).select('+password')
            if (user) {
                if (await user.comparePassword(password, user.password)) {
                    let token = signToken(user._id, user.username)
                    let data = {
                        token,
                        username: user.username
                    }
                    res.status(200).json({
                        status: 'success',
                        data
                    })
                }
                else {
                    res.status(400).json({
                        status: 'fail',
                        error: 'Invalid username or password'
                    }) 
                }
            }
            else {
                res.status(404).json({
                    status: 'fail',
                    error: 'No user found'
                })
            }

        }
        else {
            res.status(400).json({
                status: 'fail',
                error: 'username and password is required'
            })
        }


    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 'fail',
            error: 'Something went wrong, please try again'
        })
    }

}

module.exports = { register, login }


/* 

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });





*/