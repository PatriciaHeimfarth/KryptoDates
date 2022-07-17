import './App.css';

import DatingABI from "./contracts/DatingABI.json"
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
import ProfileList from './components/ProfileList';
import MyProfile from './components/MyProfile';
import ProfileDetails from './components/ProfileDetails'
import 'bootstrap/dist/css/bootstrap.min.css';

const contractAddress = "0x4e0b73a755EBCC5652eA55099008eC0Bd3D5CD0a"



function App() {
  const [currentAccount, setCurrentAccount] = useState(null);

  useEffect(() => {
    // checkWalletIsConnected();
    // fetchAllProfiles();
    //addProfile();
    //deleteAllProfiles();
  }, [])

  const checkWalletIsConnected = async () => {

    const { ethereum } = window;

    if (!ethereum) {
      console.log("no metamask")
      return;
    }
    else {
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        console.log("Account found", accounts[0])
        setCurrentAccount(accounts[0])
      }
      catch (error) {
        console.log(error)
      }
    }
  }

  const addProfile = async () => {

    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, DatingABI, signer)

      const result = await contract.addProfile("name2", "description2", 100).send({
        feeLimit: 100_000_000,
        callValue: 0,
        shouldPollResponse: true
      });

      console.log(result)

    }


    catch (err) {

    }


  }

  const fetchAllProfiles = async () => {

    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, DatingABI, signer)

      console.log(contract)
      const profiles = await contract.profiles(0);

      console.log(profiles)
      return profiles
    }


    catch (err) {
      console.log(err)
    }
  }

  const deleteAllProfiles = async () => {

    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, DatingABI, signer)

      console.log(contract)
     

      const profiles = [];

      const profileId = await contract.profileId();

      for (let i = 0; i < profileId; i++) {
        const profile = await contract.profiles(i)
        if (profile.name != "") // filter the deleted
        {
          console.log(profile)
          await contract.deleteProfile(i)
        }

      }

     
    }

    catch (err) {
      console.log(err)
    }


  }
  return (
    <div>
       
      <ProfileDetails image="/uploads/ga-RBerxXPnZPE-unsplash.jpg"></ProfileDetails>

       
    </div>


  );


}

export default App;