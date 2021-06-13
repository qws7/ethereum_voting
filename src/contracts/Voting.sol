
pragma solidity ^0.8.4;


import "./registration.sol";

//контракт,с помощью которого избиратели голосуют
contract Voting {
    struct Param {
        string title;
        string description;
    }

    struct Vote {
        uint indofAdr; // индекс адреса участников голосованния
        string encryptedVote; //гомоморфное зашифрование 0 и 1.1-значит голос
    }

    address public base;
    address public manager;
    address public Registration;
    string public title;
    string public description;
    uint public time_start;
    uint public endTime;
    Param[] public parametrs;
    string public publicKey;
    uint[] public publishedResult;

    mapping(address => Vote) private votes; // хэш-таблица содержащая адреса избирателей и их зашифрованные голоса
    address[] private addrswhoVoted; // адреса участников,кто проголосовал

    //инициализирует контракт требующимися параметрами
    constructor(address _manager,address _registration,string memory _title,string memory _description,uint _time_start,uint _endTime,string memory _publicKey
    )  {
        base = msg.sender;
        Registration = _registration;
        manager = _manager;
        title = _title;
        description = _description;
        time_start = _time_start;
        endTime = _endTime;
        publicKey = _publicKey;
    }

 
    modifier manager1() {
        require(msg.sender == manager, "Only administator");
        _;
    }

    // modifier factory() {
    //     require(msg.sender == base, "Только базе голосований разрешено использовать эту функцию");
    //     _;
    // }

    modifier beforeVoting() {
        require(block.timestamp < time_start, "Only before voting");
        _;
    }

    modifier duringVoting() {
        require(block.timestamp > time_start && block.timestamp < endTime, "Only during voting");
        _;
    }

    modifier afterVoting() {
        require(block.timestamp > endTime, "Only after voting");
        _;
    }

    //Эту функцию можно использовать только до начала голосования,чтобы добавить новые опции в бюллетень
    function addParam(string memory _title, string memory _description) external manager1 beforeVoting {
        parametrs.push(Param({ title: _title, description: _description }));
    }

    //возвращает все опции,находящиеся в бюллетене
    function getParametrs() external view returns( Param[] memory) {
        return parametrs;
    }

    //возвращет все адресы избирателей,которые проголосовали
    function getListOfVoted() external view afterVoting returns(address[] memory votersList) {
        return addrswhoVoted;
    }

    //только после того,как голосование закончено можно получит зашифрованные голоса каждого избирателя
    function getEncryptedVots(address _address) external view afterVoting returns(string memory encryptedVote) {
        return votes[_address].encryptedVote;
    }

    //публикация зашифрованной суммы голосов для каждой опции(кандидата)
    function publishResults(uint[] memory results) external manager1 afterVoting returns(bool success) {
        publishedResult = results;
        return true;
    }

    //возвращает список окончательных голосов для каждой опции(кандидата)
    function getResults() external view afterVoting returns(uint[] memory results) {
        return publishedResult;
    }
    //узнает оправил ли избиратель свой голос
    function yetVoted(address _address) public view returns(bool) {
        if(addrswhoVoted.length == 0) return false;
        return (addrswhoVoted[votes[_address].indofAdr] == _address);
    }
    //проверяет зарегистрирован ли голосующий
    function yetRegistered(address _address) private view returns(bool) {
        registration r = registration(Registration);
        return r.isVoter(_address);
    }

    
    //присвоение зашифрованного голоса избирателю,избирать может голосовать несколько раз,отменяя последние голоса
    function vote(string memory _encryptedVote) external duringVoting returns(bool success) {
        require(yetRegistered(msg.sender), "Not Registerd");

        votes[msg.sender].encryptedVote = _encryptedVote;

        if(!yetVoted(msg.sender)) {
            addrswhoVoted.push(msg.sender);
            votes[msg.sender].indofAdr = addrswhoVoted.length - 1;
        }

        return true;
    }

    

    
}