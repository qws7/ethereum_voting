
pragma solidity ^0.8.4;
contract registration {
    address public admin;
    struct Voter {
        bool registered_voter;
        address addr;
        uint index;
        string name;
        string strAddr;
        string birth;    
        string pasport;
    }
    address[] private addrVoters;//адреса избирателей
    mapping(address => Voter) private voters;//хранение информации о избирателе
    //инициализация контракта и установка создателя контракта администратором
    constructor() {
        admin = msg.sender;
    }

    //функция регистрирующая пользователя
    function register(address _voter) external {
        require(msg.sender == admin, "Only admin");
        if (voters[_voter].registered_voter == false) {
            addrVoters.push(_voter);
            voters[_voter].addr = _voter;
            voters[_voter].index = (addrVoters).length - 1;
            voters[_voter].registered_voter = true;           
        }    
    }
    //Отмена регистрации
    function delete_voter(address _voter) external  {
        require(msg.sender == admin, "Only admin");
        require(voters[_voter].registered_voter == true, "Not registered");
        voters[_voter].registered_voter = false;
        uint a = voters[_voter].index;
        address b = addrVoters[addrVoters.length - 1];
        addrVoters[a] = b;
        voters[b].index = a;
        addrVoters.pop();
    }
    //список зарегистрировавшихся
    function list_of_registered() public view returns(address[] memory) {
    return addrVoters;
    }
    //получение информации о определенном пользоватле
    function info_of_registered(address _voter) public view returns( Voter memory) {
    return voters[_voter];
    }
    //функция проверяет является ли адрес зарегистрированным
    function registered_voter(address _voter) public view returns(bool) {
        if (addrVoters.length == 0) return false;
        return (voters[_voter].registered_voter);
    }

    


    

}