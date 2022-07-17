import Image from 'react-bootstrap/Image'
import DatingABI from "../contracts/DatingABI.json"
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import "bootstrap/dist/css/bootstrap.css";
const contractAddress = "0x4e0b73a755EBCC5652eA55099008eC0Bd3D5CD0a"

function ProfileDetails(props) {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    useEffect(() => {
        getProfile();
        console.log(props)
        if (!currentAccount) {
            checkWalletIsConnected();
        }

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

    const getProfile = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, DatingABI, signer)

            const profileId = await contract.profileId();

            const profiles = [];


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
            console.log(profiles)

        }

        catch (err) {
            console.log(err)
        }
    }

    const writeMessage = async () => {
        try {
            const { ethereum } = window;
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, DatingABI, signer)

            const profileId = await contract.profileId();

            const profile = await contract.profiles(1)

            console.log(ethereum)

            const params = [
                {
                    from: currentAccount,
                    to: profile.owner,
                    value: '0x89a2241af62c0000',
                    gas: '0x2710',
                },
            ];

            ethereum
                .request({
                    method: 'eth_sendTransaction',
                    params,
                })
                .then((result) => {
                    handleShow();
                    console.log(result)

                })
                .catch((error) => {

                });
        }

        catch (err) {
            console.log(err)
        }

    }


    return (
        <div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Your message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group
                            className="mb-3"
                            controlId="exampleForm.ControlTextarea1"
                        >
                            <Form.Label>Send a message</Form.Label>
                            <Form.Control as="textarea" rows={3} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Send
                    </Button>
                </Modal.Footer>
            </Modal>
            <Image roundedCircle style={{ height: 'auto', width: '20%' }} src={props.image}></Image>
            <Button onClick={writeMessage}>Send</Button>
        </div>
    );


}

export default ProfileDetails; 