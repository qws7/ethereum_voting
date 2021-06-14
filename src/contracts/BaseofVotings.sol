pragma solidity ^0.8.4;

import "./Voting.sol";

contract BaseofVotings {
    address public admin;
    address[] public created_votings;
    address public registration2;
    /// инициализирует контракт,приняв адрес контракта голосования,который понадобится для создания голосований, и устанавливает создателя контракта администратором
    constructor(address _registration2) {
        admin = msg.sender;
        registration2 = _registration2;
    }
    //создает новый контракт голосования
    function create_voting(string memory _encryption_key,string memory _title,string memory _description,uint _time_start,uint _endTime)
        public  {
        require(msg.sender == admin, "Only admin");
        created_votings.push(address(new Voting(admin,registration2,_encryption_key,_title,_description,_time_start,_endTime)));
    }
    //вернет адреса контрактов всех созданных голосований 
    function all_created_votings() public view returns(address[] memory) {
        return created_votings;
    }
}