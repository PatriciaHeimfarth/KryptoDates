import DatingABI from "../contracts/DatingABI.json"
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
import axios from "axios"
import Image from 'react-bootstrap/Image'
import "bootstrap/dist/css/bootstrap.css";

const contractAddress = "0x4e0b73a755EBCC5652eA55099008eC0Bd3D5CD0a"

/*
Getting all profiles which are stored with an image in the database and show a list
of the images which are clickable. A click on an image gets the user to the profile details-^^
*/

function ProfileList() {
    const [profileList, setProfileList] = useState(null);
    const [imagesList, setImagesList] = useState(null);

    useEffect(() => {

        axios.get('http://localhost:8080/')
            .then(res => {
                setImagesList(res.data.items)

            })
        if (!profileList) {
            fetchAllProfiles();
        }
        else {
            console.log(profileList)
        }

    }, [])



    const fetchAllProfiles = async () => {

        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, DatingABI, signer)

            console.log(contract)
            const list = await contract.profiles(0);




            const profiles = [];

            const profileId = await contract.profileId();

            for (let i = 0; i < profileId; i++) {
                const profile = await contract.profiles(i)
                console.log(profile)
                if (profile.name != "") // filter the deleted
                {
                    profiles.push(
                        { id: i, name: profile.name, description: profile.description, price: window.tronWeb.fromSun(profile.priceForMessage) }
                    )
                }

            }

            setProfileList(profiles)

        }

        catch (err) {
            console.log(err)
        }


    }

    return (imagesList &&
        imagesList.map(p => (
            <div>
                <h1>{p.userconnected}</h1>
                <Image roundedCircle style={{height:'auto',width:'20%'}} src={"/uploads/" + p.imageName}></Image>
            </div>

        )
        )
    );
}

export default ProfileList;