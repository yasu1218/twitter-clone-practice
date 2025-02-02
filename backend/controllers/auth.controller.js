



//  @desc       Register new user
//  @route      POST /api/
//  @access     Public 
export const signup = async (req, res) => {
  res.json({
    data: "You hit the signup endpoint",
  });    
}

//  @desc       Login user
//  @route      POST /api/
//  @access     Public 
export const login = async (req, res) => {
  res.json({
    data: "You hit the login endpoint",
  });    
}

//  @desc       Logout user
//  @route      POST /api/
//  @access     Public 
export const logout = async (req, res) => {
  res.json({
    data: "You hit the logout endpoint",
  });    
}

// export