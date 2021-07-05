pragma solidity ^0.6.6;
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract ChainlinkLottery is VRFConsumerBase{
    address public manager;
    address payable[] public players; //should make this a mapping
    
    bytes32 internal keyHash;
    uint256 internal fee;
    
    uint256 public randomResult;
    
    constructor() public VRFConsumerBase(0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, 0x01BE23585060835E02B77ef475b0Cc51aA1e0709) {
        manager = msg.sender;
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10 ** 18;//100000000000000000;
    }

    /**
     * @notice Enter the lottery
     */
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

    /**
     * @notice Get the Players entered in this lottery
     *
     * @return address []
     */
    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    /**
     * Restricted to owner only modifier
     */    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    /**
     * @notice Withdraw LINK from this contract.
     * @dev this is an example only, and in a real contract withdrawals should
     * happen according to the established withdrawal pattern: 
     * https://docs.soliditylang.org/en/v0.4.24/common-patterns.html#withdrawal-from-contracts
     * @param to the address to withdraw LINK to
     * @param value the amount of LINK to withdraw
     */
    function withdrawLINK(address to, uint256 value) public restricted {
        require(LINK.transfer(to, value), "Not enough LINK");
    }

    /**
     * @notice Set the key hash for the oracle
     *
     * @param newKeyHash bytes32
     */
    function setKeyHash(bytes32 newKeyHash) public restricted {
        keyHash = newKeyHash;
    }

    /**
     * @notice Get the current key hash
     *
     * @return bytes32
     */
    function getKeyHash() public view returns (bytes32) {
        return keyHash;
    }

    /**
     * @notice Set the oracle fee for requesting randomness
     *
     * @param newFee uint256
     */
    function setFee(uint256 newFee) public restricted {
        fee = newFee;
    }

    /**
     * @notice Get the current fee
     *
     * @return uint256
     */
    function getFee() public view returns (uint256) {
        return fee;
    }

}   