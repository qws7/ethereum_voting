pragma solidity ^0.8.4;


import "./Voting.sol";

contract BaseofVotings {
    address public manager;
    address public registration2;
    address[] public createdVotings;

    /// инициализирует контракт и устанавливает создателя контракта администратором
    constructor(address _registration2) {
        manager = msg.sender;
        registration2 = _registration2;
    }

    //функции с таким модификатором разрешенно использовать только администраторам
    modifier onlyadm() {
        require(msg.sender == manager, "Only admin");
        _;
    }

    //создает новый контракт голосования
    function createVoting(string memory _title,string memory _description,uint _time_start,uint _endTime,string memory _encryptionKey)
        public onlyadm {
        createdVotings.push(
            address(new Voting(manager,registration2,_title,_description,_time_start,_endTime,_encryptionKey))
        );
    }

    //вернет адреса контрактов все созданных голосований 
    function allCreatedVotings() public view returns(address[] memory) {
        return createdVotings;
    }
}