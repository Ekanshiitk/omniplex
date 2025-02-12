"use client";

import { useState } from "react";
import axios from "axios";
import Auth from "../Auth/Auth";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,  
  createUserWithEmailAndPassword  
} from "firebase/auth"; 
import { initializeApp, getApps } from "firebase/app";
import { db, firebaseConfig } from "../../../firebaseConfig"; 
import { useRouter } from "next/navigation";
import { doc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc, getDoc, addDoc} from "firebase/firestore";

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const auth = getAuth();

export default function Login() {
  const [email, setEmail] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isEmailValidated, setIsEmailValidated] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    console.log("Opening Google Auth...");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google Sign-In Successful:", user);
      
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: user.email,
        name: user.displayName,
        createdAt: new Date(),
      }, { merge: true });

      alert(`Welcome ${user.displayName}`);
      router.push("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const checkIfEmailExists = async (email: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(`Email found: ${email}`);
      } else {
        console.log(`No account found for ${email}`);
      }
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
};

  const handleEmailAuth = async () => {
    if (!email) return alert("Please enter an email");
    if (!isEmailValidated) return alert("You must validate your email first");
  
    const emailExists = await checkIfEmailExists(email);
  
    if (emailExists) {
      const password = prompt("Enter your password:");
      if (!password) return alert("Password is required");
  
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Email Sign-In Successful:", user);
        alert(`Welcome back, ${user.email}`);
        router.push("/");
      } catch (error: any) {
        console.error("Email Sign-In Error:", error);
        if (error.code === "auth/wrong-password") {
          alert("Incorrect password. Try again.");
        } else {
          alert("Authentication failed.");
        }
      }
    } else {
      const confirmSignup = confirm(`No account found for ${email}. Do you want to sign up?`);
      if (!confirmSignup) return;
  
      const password = prompt("Create a password:");
      if (!password) return alert("Password is required");
  
      try {
        const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = newUserCredential.user;
        console.log("New User Created:", newUser);
  
        const userRef = doc(db, "users", newUser.uid);
        await setDoc(userRef, {
          email: newUser.email,
          createdAt: new Date(),
        });
  
        alert(`Account created for ${newUser.email}`);
        router.push("/");
      } catch (error: any) {
        console.error("Error creating account:", error);
  
        if (error.code === "auth/email-already-in-use") {
          alert("This email is already in use. Try signing in.");
        } else if (error.code === "auth/invalid-email") {
          alert("Invalid email format.");
        } else if (error.code === "auth/weak-password") {
          alert("Password is too weak. Use at least 6 characters.");
        } else {
          alert("Failed to create account.");
        }
      }
    }
  };

  const validateEmail = async () => {
    if (!email) return alert("Please enter an email");

    setIsValidating(true);
    try {
      const options = {
        method: "GET",
        url: "https://mailok-email-validation.p.rapidapi.com/verify",
        params: { email },
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          "x-rapidapi-host": "mailok-email-validation.p.rapidapi.com",
        },
      };

      console.log("Making API request with:", options);
      const response = await axios.request(options);
      console.log("API Response:", response.data);
      setValidationResult(response.data);

      if (response.data.status === "valid") {
        setIsEmailValidated(true); 
      } else {
        alert("Invalid email. Please enter a valid email.");
      }
    } catch (error) {
      console.error("Error validating email:", error);
      alert("API Error: Failed to validate email");
      setValidationResult({ status: "error", message: "Failed to validate email" });
    }
    setIsValidating(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col lg:flex-row items-center justify-center bg-[rgb(30,30,30)] z-[99999] w-full h-full">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 sm:px-12 md:px-16 space-y-6 sm:space-y-10">
        <div className="absolute top-5 left-5 sm:left-10 flex items-center space-x-3">
          <Image src="/logo.svg" alt="Omniplex Logo" width={32} height={32} />
          <span className="text-white text-lg sm:text-2xl font-light text-center">
            Omniplex
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-tight text-center py-4 max-w-sm sm:max-w-md">
          Where Knowledge Evolves
        </h1>

        <div className="w-full max-w-sm sm:max-w-md bg-[rgb(21,21,21)] p-6 sm:p-8 rounded-2xl shadow-lg">
          <button
            className="flex items-center justify-center w-full bg-[rgb(35,35,35)] text-white rounded-lg py-3 mb-4 sm:mb-6 hover:bg-gray-300 hover:text-black transition"
            onClick={handleAuth}
          >
            <FcGoogle size={22} className="mr-2" />
            Continue with Google
          </button>

          <div className="flex items-center my-3 sm:my-4">
            <hr className="w-full" />
            <span className="px-2 text-gray-400 text-xs sm:text-sm">OR</span>
            <hr className="w-full" />
          </div>

          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black text-white rounded-md px-4 py-2 sm:py-3 mb-2" placeholder="Enter your email" />

          <button onClick={validateEmail} className="w-full py-2 rounded-lg mb-3 bg-black text-white hover:bg-white hover:text-black" disabled={isEmailValidated || isValidating}>
            {isEmailValidated ? "Validated" : isValidating ? "Validating..." : "Validate Email"}
          </button>

          <button onClick={handleEmailAuth} className="w-full bg-white text-black py-2 rounded-lg hover:bg-black hover:text-white" disabled={!isEmailValidated}>
            Continue with Email
          </button>
        </div>
      </div>

      <div className="hidden lg:flex w-full lg:w-[49%] h-full bg-[rgb(21,21,21)] rounded-2xl"></div>
    </div>
  );
}