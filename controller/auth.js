module.exports ={

  // authenticating Admin.

    verifyAdmin :(req,res,next)=>{
        if(req.session.adminLogin==true){
          console.log(req.session.adminLogin);
            next()
        }else{
          console.log(req.session,'else');
            res.redirect('/admin/login')
        }
      },

  // authenticating User.
  
      verifyUser : (req,res,next)=>{
      if (req.session.loggedIn == true) {
        next()
      }else{
        console.log(req.session)
        res.redirect('/login')
      }
    }
}