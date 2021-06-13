
pragma solidity ^0.8.4;



contract registration {
    struct Voter {
        bool isVoter;
        address addr;
        uint index;
        string name;
        string strAddr;
        string birth;    
        string id;
    }

    address public manager;

    mapping(address => Voter) private voters;//хранение информации о избирателе
    address[] private addrVoters;//адреса избирателей 

    //инициализация контракта и установка создателя контракта администратором
    constructor() {
        manager = msg.sender;
    }

    
    //модификатор,который разрешает только администратору использовать функцию,к которой данный модификатор относится
    modifier onlyManager() {
        require(msg.sender == manager, "Only admin");
        _;
    }

    //функция регистрирующая пользователя или обновляющая информацию о уже зарегистрировавшемся избирателе
    function registerUpdate(
        address _voter,
        string memory _name,
        string memory _strAddr,
        string memory _birth,
        string memory _id) external onlyManager {

        if (voters[_voter].isVoter == false) {
            addrVoters.push(_voter);
            voters[_voter].index = (addrVoters).length - 1;
            voters[_voter].isVoter = true;
            voters[_voter].addr = _voter;
        }

        voters[_voter].name = _name;
        voters[_voter].strAddr = _strAddr;
        voters[_voter].birth = _birth;
        voters[_voter].id =_id;
    }

    //Отмена регистрации
    function deleteVoter(address _voter) external onlyManager {
        require(voters[_voter].isVoter == true, "Not registered");

        voters[_voter].isVoter = false;
        uint a = voters[_voter].index;
        address b = addrVoters[addrVoters.length - 1];
        addrVoters[a] = b;
        voters[b].index = a;
        addrVoters.pop();
    }

    //функция проверяет принадлежит ли избирателю определенный адрес
    function isVoter(address _voter) public view returns(bool) {
        if (addrVoters.length == 0) return false;
        return (voters[_voter].isVoter);
    }

    //число зарегистрировавшихся избиратель
    function numberVoters() public view returns(uint) {
        return addrVoters.length;
    }

    //список зарегистрировавшихся пользователей
    function listVoters() public view returns(address[] memory) {
        return addrVoters;
    }

    //получение информации о определенном пользоватле
    function infoVoter(address _voter) public view returns( Voter memory) {
        return voters[_voter];
    }
}