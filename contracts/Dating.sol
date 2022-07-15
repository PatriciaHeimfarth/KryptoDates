pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }

    function _msgValue() internal view virtual returns (uint256 value) {
        return msg.value;
    }
}

abstract contract Owner is Context {
    address public owner;

    constructor() {
        owner = _msgSender();
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_msgSender() == owner);
        _;
    }

    /**
     * @dev Check if the current caller is the contract owner.
     */
    function isOwner() internal view returns (bool) {
        return owner == _msgSender();
    }
}

contract Dating is Owner {
    struct Profile {
        string name;
        string description;
        uint256 priceForMessage;
        address owner; // owner of the profile
    }

    uint256 public profileId;

    mapping(uint256 => Profile) public profiles;

    function addProfile(
        string memory name,
        string memory description,
        uint256 priceForMessage
    ) public returns (bool success) {
        Profile memory profile = Profile(
            name,
            description,
            priceForMessage,
            _msgSender()
        );

        profiles[profileId] = profile;

        emit NewProfile(profileId++);

        return true;
    }

    function deleteProfile(uint256 _profileId) public returns (bool) {
        require(
            _msgSender() == profiles[_profileId].owner || isOwner(),
            "You are not authorised to delete this profile."
        );

        delete profiles[_profileId];

        emit DeleteProfile(_profileId);

        return true;
    }

    function updateProfile(
        uint256 _profileId,
        string memory name,
        string memory description,
        uint256 priceForMessage
    ) public returns (bool) {
        profiles[_profileId].name = name;
        profiles[_profileId].description = description;
        profiles[_profileId].priceForMessage = priceForMessage;

        return true;
    }

    function _sendBTT(address receiver, uint256 value) internal {
        payable(address(uint160(receiver))).transfer(value);
    }

    event NewProfile(uint256 indexed profileId);

    event DeleteProfile(uint256 indexed profileId);

    struct Message {
        string content;
        address receiver;
        address sender;
        uint256 sendingTime;
    }

    uint256 public messageId;

    mapping(uint256 => Message) public messages;

    function writeMessage(
        string content,
        address receiver,
        address sender
    ) public returns (bool success) {
        Message memory message = Message(
            content,
            receiver,
            _msgSender(),
            //NOW
        );

        messages[messageId] = message;

        emit NewProfile(messageId++);

        return true;
    }
}
