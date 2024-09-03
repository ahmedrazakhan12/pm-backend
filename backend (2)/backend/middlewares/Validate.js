const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing

// Password criteria (modify as needed)
const minLength = 8;
const maxLength = 20;
const hasUpperCase = /[A-Z]/;
const hasLowerCase = /[a-z]/;
const hasNumbers = /\d/;

const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/;

// Name criteria (modify as needed)
const nameMinLength = 3;
const nameMaxLength = 20;

// Email regex pattern (modify as needed)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contact number criteria (modify as needed)

// const validateAllfields = ({
//   name,
//   email,
//   contact,
//   status,
//   address,
//   password,
//   confirmPassword,
// }) => {
//   if (
//     !name ||
//     !email ||
//     !contact ||
//     !status ||
//     !address ||
//     !password ||
//     !confirmPassword
//   ) {
//     return "All fields are required.";
//   }
// };
// Validate name
const validateName = (name) => {
  console.log(name);
  if (!name) {
    return "Name is required.";
  }
  if (name.length < nameMinLength || name.length > nameMaxLength) {
    return `Name must be between ${nameMinLength} and ${nameMaxLength} characters.`;
  }
  return null; // Indicates valid
};

// Validate email
const validateEmail = (email) => {
  if (!email) {
    return "Email is required.";
  }
  if (!emailPattern.test(email)) {
    return "Invalid email format.";
  }
  //   return null; // Indicates valid
};
// Define a pattern for phone numbers with country code

const validateContact = (contact) => {
  if (!contact) {
    return "Contact number is required.";
  }
  if (contact.length < contact.minLength || contact.length > 15) {
    return `Contact must be between ${minLength} and ${maxLength} characters.`;
  }

  return null; // Indicates valid
};

// Validate password
const validatePassword = (password,confirmPassword ) => {
 
  
  if (!password ) {
    return "Password is required.";
  }
  if(!confirmPassword){
    return "Confirm Password is required.";
  }

  if(password !== confirmPassword){
    return "Passwords do not match.";
  }


  if (password.length < minLength || password.length > maxLength) {
    return `Password must be between ${minLength} and ${maxLength} characters.`;
  }
  if (
    !(
      hasUpperCase.test(password) &&
      hasLowerCase.test(password) &&
      hasNumbers.test(password) &&
      hasSpecialChars.test(password)
    )
  ) {
    return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
  }
  //   return null; // Indicates valid
};



// const validatePassword = (password, confirmPassword) => {
 
//   if (!password) {
//     return "Password is required.";
//   }
//   if (!confirmPassword) {
//     return "Confirm Password is required.";
//   }

//   if (!confirmPassword || confirmPassword.length === 0) {
//     return "Confirm password is required.";
//   }
//   if (password !== confirmPassword) {
//     return "Passwords do not match.";
//   }

//   if (password.length < minLength || password.length > maxLength) {
//     return `Password must be between ${minLength} and ${maxLength} characters.`;
//   }
//   if (
//     !(
//       hasUpperCase.test(password) &&
//       hasLowerCase.test(password) &&
//       hasNumbers.test(password) &&
//       hasSpecialChars.test(password)
//     )
//   ) {
//     return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
//   }
//   //   return null; // Indicates valid
// };

const validateAddress = (address) => {
  const minLength = 5; // Define minimum length for the address

  // Check if address is empty
  if (!address || address.trim() === "") {
    return "Address cannot be empty.";
  }

  // Check if address meets the minimum length requirement
  if (address.length < minLength) {
    return `Address must be at least ${minLength} characters long.`;
  }
};

const validateDescription = (description) => {
  const minLength = 100;
  const maxLength = 2500;

  if (!description || description.trim() === "") {
    return "Description cannot be empty.";
  }
  console.log("Description:", description.length);
  if (description.length < minLength || description.length > maxLength) {
    return `Description must be between ${minLength} and ${maxLength} characters.`;
  }
  
};


const validateEditPassword = (password, confirmPassword) => {
  console.log("Password:", password);
  if (password.length === 0 && confirmPassword.length === 0) {
  }
  if (password !== "null" || confirmPassword.length > 0) {
    console.log("Password:", password.length);
    console.log("Confirm Password:", confirmPassword);

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (password.length < minLength || password.length > maxLength) {
      return `Password must be between ${minLength} and ${maxLength} characters.`;
    }

    console.log("Has uppercase:", hasUpperCase.test(password));
    console.log("Has lowercase:", hasLowerCase.test(password));
    console.log("Has numbers:", hasNumbers.test(password));
    console.log("Has special chars:", hasSpecialChars.test(password));

    if (
      !(
        hasUpperCase.test(password) &&
        hasLowerCase.test(password) &&
        hasNumbers.test(password) &&
        hasSpecialChars.test(password)
      )
    ) {
      return "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
  }
  //   return null; // Indicates valid
};
const validServiceType = (service) => {
  const maxLength = 25;

  if (!service) {
    return "Service type is required.";
  }

  if (service.length > maxLength) {
    return `Service type must be no more than ${maxLength} characters long.`;
  }
};

const validateCountry = (country) => {
  const minLength = 2;
  const maxLength = 20;

  if (!country) {
    return "Country is required.";
  }
  if (country.length < minLength || country.length > maxLength) {
    return `Country must be between ${minLength} and ${maxLength} characters.`;
  }
};

const validateState = (state) => {
  const minLength = 2;
  const maxLength = 50;

  if (!state) {
    return "State is required.";
  }
  if (state.length < minLength || state.length > maxLength) {
    return `State must be between ${minLength} and ${maxLength} characters.`;
  }
};


const validatePostalCode = (postalCode) => {
  // Define postal code pattern as per your requirements
  const postalCodePattern = /^\d{5}$/; // Example: 5-digit postal code

  if (!postalCode) {
    return "Postal code is required.";
  }
  if (!postalCodePattern.test(postalCode)) {
    return "Invalid postal code format.";
  }
};

const validateCity = (city) => {
  const minLength = 2;
  const maxLength = 50;

  if (!city) {
    return "City is required.";
  }
  if (city.length < minLength || city.length > maxLength) {
    return `City must be between ${minLength} and ${maxLength} characters.`;
  }
};
const validateStatus = (status) => {
  if (!status) {
    return "Role is required.";
  }

 
  if (/[A-Z]/.test(status)) {
    return "Role must not contain capital letters.";
  }
  if (status.length > 20) {
    return "Role must not exceed 20 characters.";
  }

  }




module.exports = {
  //   validateAllfields,
  validateEditPassword,
  validateName,
  validateEmail,
  validateContact,
  validatePassword,
  validateAddress,
  validServiceType,
  validateCountry,
  validateState,
  validatePostalCode,
  validateCity,
  validateDescription,
  validateStatus,
};
