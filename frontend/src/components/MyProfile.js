import DatingABI from "../contracts/DatingABI.json"
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button'

const contractAddress = "0x4e0b73a755EBCC5652eA55099008eC0Bd3D5CD0a"

function MyProfile() {
    const [myProfile, setMyProfile] = useState(null);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [images, setImages] = useState([]);
    const [imageURLs, setImageURLs] = useState([]);
    const [username, setUsername] = useState(null);
    const [description, setDescription] = useState(null);


    useEffect(() => {


        if (!currentAccount) {
            checkWalletIsConnected();
        }

        if (!myProfile) {
            fetchAllProfiles();
        }
        else {
            console.log(myProfile)
        }

    }, [])

    useEffect(() => {
        fetchAllProfiles();
    }, [currentAccount])

    useEffect(() => {

        if (images.length < 1) return;

        const newImageUrls = [];
        newImageUrls.push(URL.createObjectURL(images));
        setImageURLs(newImageUrls);

    }, [images]);




    const onImageChange = (e) => {
        setImages(e.target.files[0])
        console.log(images)
    }

    const handleChange = (event) => {
        //  const name = event.target.name;
        //  const value = event.target.value;
        // setMyProfile(values => ({ ...values, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        addOrChangeProfile();
    }


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

    const fetchAllProfiles = async () => {

        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, DatingABI, signer)


            const profiles = [];

            const profileId = await contract.profileId();

            for (let i = 0; i < profileId; i++) {
                const profile = await contract.profiles(i)
                console.log(profile)
                if (profile.name != "" && profile.owner.toLowerCase() == currentAccount.toLowerCase()) // filter the deleted
                {
                    profiles.push(
                        { id: i, name: profile.name, owner: profile.owner, description: profile.description, price: window.tronWeb.fromSun(profile.priceForMessage) }
                    )

                    setMyProfile(profile)
                     
                    //Prefill the form with the data from the profile
                    //Base values which can be changed
                    //User can see what he has written before
                    setDescription(profile.description)
                    setUsername(profile.name)
                }

            }


        }

        catch (err) {
            console.log(err)
        }


    }


    const addOrChangeProfile = async () => {

        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, DatingABI, signer)

            //When myProfile is empty it was not in the profiles list and this means it doesn't exist already
            //so we can add a new one
            if (!myProfile) {
                console.log(username, description)
                const result = await contract.addProfile(username, description, 100).send({
                    feeLimit: 100_000_000,
                    callValue: 0,
                    shouldPollResponse: true
                });

                console.log(result)


            }
            //Change the profile we already have
            //Get the profile which is connected with the wallet address as an owner
            //change the properties according to the values in the form

            else {
                const profileId = await contract.profileId();

                for (let i = 0; i < profileId; i++) {
                    const profile = await contract.profiles(i)

                    if (profile.name != "" && profile.owner.toLowerCase() == currentAccount.toLowerCase()) // filter the deleted
                    {

                        const result = await contract.updateProfile(i, username, description, 101).send({
                            feeLimit: 100_000_000,
                            callValue: 0,
                            shouldPollResponse: true
                        });
                    }
                }

                //Fetch new because here we have changed the profile and we get the changes here
                fetchAllProfiles();
            }
        }
        catch (err) {

        }
    }


    const deleteProfile = async () => {

        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, DatingABI, signer)

            const profileId = await contract.profileId();


            const result = await contract.deleteProfile(profileId).send({
                feeLimit: 100_000_000,
                callValue: 0,
                shouldPollResponse: true
            });

            console.log(result)


        }
        catch (err) {
            console.log(err)
        }


    }


    //if profile
    return (
        <div>
            <h1>My Profile</h1>

            <h2>Profile Data</h2>
            <form onSubmit={handleSubmit}>
                <label>Enter your name:
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}

                    />
                </label>
                <label>Enter your description:
                    <textarea
                        type="text"
                        name="description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </label>
                <input type="submit" />
            </form>


            <h2>Image</h2>
            <form action="http://localhost:8080/" method="POST" enctype="multipart/form-data">
                <div>
                    <label for="name">Image Title</label>
                    <input type="hidden" id="name" placeholder="Name"
                        value={currentAccount} name="userconnected" required></input>
                </div>

                <div>
                    <label for="image">Upload Image</label>
                    <input type="file" id="image"
                        name="img" value={images.filename} required onChange={onImageChange}></input>
                </div>
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>

            <h2>Delete My Profile</h2>
            <Button onClick={deleteProfile}>Delete</Button>
        </div>

    );
}

export default MyProfile;