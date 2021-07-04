pragma solidity ^0.6.6;
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract ChainlinkLottery is VRFConsumerBase{
    address public manager;
    address payable[] public players;
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;
    
    constructor() public VRFConsumerBase(0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, 0x01BE23585060835E02B77ef475b0Cc51aA1e0709) {
        manager = msg.sender;
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10 ** 18;//100000000000000000;
    }
    
    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }
    
        /** 
     * Requests randomness 
     * Returns a hash essentially (requestId)
     */
    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness.mod(players.length).add(1);
    }
    
    function pickWinner() public restricted {
        require(LINK.balanceOf(address(this))>= fee, "Not enough LINK to pay fee");
        getRandomNumber();
        
        players[randomResult].transfer(address(this).balance);
        players = new address payable[](0);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}   