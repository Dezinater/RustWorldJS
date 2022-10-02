const register = require('@babel/register').default;
//import register from "@babel/register";

register({ extensions: ['.ts', '.tsx', '.js', '.jsx'] });