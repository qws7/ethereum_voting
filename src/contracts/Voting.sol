
pragma solidity ^0.8.4;


import "./registration.sol";

contract Voting {
    struct Param {
        string title;//имя варианта
        string description;// описание варианта
    }

    struct Vote {
        uint index_of_adr; // индекс адреса участников голосованния
        string encrypted_vote; //гомоморфное зашифрование 0 и 1.1-значит голос
    }

    address public base;
    address public Registration;
    string public publicKey;
    address public Admin;
    string public title;
    string public description;
    uint public time_start;
    uint public endTime;
    Param[] public parametrs;
    uint[] public published_resultt;

    mapping(address => Vote) private votes; // хэш-таблица содержащая адреса избирателей и их зашифрованные голоса
    address[] private addrs_who_voted; // адреса участников,кто проголосовал

    //инициализирует контракт требующимися параметрами
    constructor(address _Admin,address _registration,string memory _publicKey,string memory _title,string memory _description,uint _time_start,uint _endTime
    )  {
        base = msg.sender;
        Registration = _registration;
        Admin = _Admin;
        publicKey = _publicKey;
        title = _title;
        description = _description;
        time_start = _time_start;
        endTime = _endTime;
        
    }
    //узнает оправил ли избиратель свой голос
    function yet_voted(address _address) public view returns(bool) {
        if(addrs_who_voted.length == 0) return false;
        return (addrs_who_voted[votes[_address].index_of_adr] == _address);
    }
    //проверяет зарегистрирован ли голосующий
    function yet_registered(address _address) private view returns(bool) {
        registration r = registration(Registration);
        return r.registered_voter(_address);
    }
    //присвоение зашифрованного голоса избирателю,избирать может голосовать несколько раз,отменяя последние голоса
    function vote(string memory _encrypted_vote) external returns(bool success) {
        require(block.timestamp > time_start && block.timestamp < endTime, "Only during voting");
        require(yet_registered(msg.sender), "Not Registerd");
        votes[msg.sender].encrypted_vote = _encrypted_vote;
        if(!yet_voted(msg.sender)) {
            addrs_who_voted.push(msg.sender);
            votes[msg.sender].index_of_adr = addrs_who_voted.length - 1;
        }
        return true;
    }
    //только после того,как голосование закончено можно получит зашифрованные голоса каждого избирателя
    function get_encrypted_votes(address _address) external view returns(string memory encrypted_vote) {
        require(block.timestamp > endTime, "Only after voting");
        return votes[_address].encrypted_vote;
    }
    //публикация расшифрованных результатов голосования для каждого варианта в контракт
    function publish_results(uint[] memory results) external returns(bool success) {
        require(msg.sender == Admin, "Only administator");
        require(block.timestamp > endTime, "Only after voting");
        published_resultt = results;
        return true;
    }

    //возвращает список окончательных голосов для каждой опции(кандидата)
    function get_results() external view returns(uint[] memory results) {
        require(block.timestamp > endTime, "Only after voting");
        return published_resultt;
    }
    

    //Эту функцию можно использовать только до начала голосования,чтобы добавить новые варианты в бюллетень
    function add_param(string memory _title, string memory _description) external {
        require(msg.sender == Admin, "Only administator");
        require(block.timestamp < time_start, "Only before voting");
        parametrs.push(Param({ title: _title, description: _description }));
    }

    //возвращает все опции,находящиеся в бюллетене
    function get_parametrs() external view returns( Param[] memory) {
        return parametrs;
    }

    //возвращет все адресы избирателей,которые проголосовали
    function get_list_of_voted() external view  returns(address[] memory voters_list) {
        require(block.timestamp > endTime, "Only after voting");
        return addrs_who_voted;
    }

}