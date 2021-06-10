import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";
import { Dimmer, Loader, Image, Segment,Sidebar,Menu,Container,Message,Dropdown,Card,Button,Icon, } from "semantic-ui-react";
import Web3 from "web3";
import '@metamask/legacy-web3';
import BaseofVotings from "../build/contracts/BaseofVotings.json";
import Voting from "../build/contracts/Voting.json";
import addresses from "../build/contracts/addresses";
import Registration from "./Registration";
import {createStore} from 'redux';
//import fs = require("fs");
import {connect} from "react-redux";
import registration from "../build/contracts/registration.json"






export class Votings extends Component {
    state = {
        network_error: false,   
        view_loader: true,
        redirect: false,
        chosen_variant: "Проводятся",
        user_registered: false,
        Votings: [],
        user_registration: false,
        user_admin: false
        
    };

    async componentDidMount() {
        await this.get_data();
    }

    async get_data() {
        let web3, registration_organ, BaseofVotings;
        try {
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
            registration_organ = this.get_Registration(web3);
            BaseofVotings = this.get_BaseofVotings(web3);
            console.log(1);
            window.web3.currentProvider.on(
                "accountsChanged",
                this.metamask_changed
                
            );
            console.log(2);

            window.web3.currentProvider.on(
                "networkChanged",
                this.metamask_changed
            );

            const addresses = await BaseofVotings.methods
                .allCreatedVotings()
                .call();

            const user_addresses = await web3.eth.getAccounts();

            await Promise.all(
                addresses.map(async e => {
                    const contract = this.get_voting(web3, e);
                    const contract_param = {
                        address: await contract._address,
                        title: await contract.methods.title().call(),
                        description: await contract.methods
                            .description()
                            .call(),
                        time_start: await contract.methods.time_start().call(),
                        endTime: await contract.methods.endTime().call(),
                        voter_voted: await contract.methods
                            .yetVoted(user_addresses[0])
                            .call()
                    };

                    this.setState({
                        Votings: [...this.state.Votings, contract_param]
                    });
                })
            );

            const registered = await registration_organ.methods
                .isVoter(user_addresses[0])
                .call();


            const manager = await BaseofVotings.methods
                .manager()
                .call();
            const user_admin = manager === user_addresses[0];
            const registration_organ_admin = await registration_organ.methods
                .manager()
                .call();
            const user_registration = registration_organ_admin === user_addresses[0];

            this.setState(function(prevState, props) {
                return {
                    view_loader: false,
                    web3,
                    registration_organ,
                    BaseofVotings,
                    user_registered: registered,
                    user_admin,
                    user_registration
                };
            });
            console.log(this.state.view_loader);
        } catch (err) {
            console.error(err);
            if (window.web3 === undefined) {
                this.setState(function(prevState, props) {
                    return { redirect: true };
                });
            } else {
                console.error(err);
                this.setState(function(prevState, props) {
                    return { network_error: true };
                });
            }
        }
    }

    get_Registration(web3) {
        const address = addresses.registration;
        const contract = new web3.eth.Contract(registration.abi, address);
        return contract;
    }

    get_BaseofVotings(web3) {
        const address = addresses.BaseofVotings;
        const contract = new web3.eth.Contract(BaseofVotings.abi, address);
        return contract;
    }

    get_voting(web3, address) {
        const contract = new web3.eth.Contract(Voting.abi, address);
        return contract;
    }

    click_i = (e, { name }) => this.setState({ chosen_variant: name });

    metamask_changed = () => {
        window.location.reload();
    };
    Convert_to_Timestamp(timestamp) {
        const variants = {
            day: "2-digit",
            year: "numeric",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        };    
        return new Date(timestamp * 1000).toLocaleDateString("da", variants);
    }

    render() {
        const chosen_variant = this.state.chosen_variant;
        return (                                         
                        <Container style={{ float: "center"}}>
                        <Sidebar.Pusher id="left" className="left" className="p2"
                        as={Menu}
                        inverted
                        vertical
                        visible
                        > 
                        <Dropdown item text="Голосования" className="normal" inverted>
                                <Dropdown.Menu inverted >
                                    <Dropdown.Item name="Прошедшие"
                                    active={this.state.chosen_variant === "Прошедшие"}
                                    onClick={this.click_i} >
                                        Прошедшие
                                    </Dropdown.Item >
                                    <Dropdown.Item name="Проводятся"
                                    active={this.state.chosen_variant === "Проводятся"}
                                    onClick={this.click_i}>
                                        Проводятся
                                    </Dropdown.Item>
                                    <Dropdown.Item name="Будущие"
                                    active={this.state.chosen_variant === "Будущие"}
                                    onClick={this.click_i}>
                                        Будущие
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                        </Dropdown>
                                {this.state.user_registration ? (
                                    <Menu.Item 
                                    className="normal"
                                    name="Регистрация избирателей"
                                    as={Link} to="/Registration"
                                    
                                >Регистрация избирателей
                                </Menu.Item> )
                                :null
                                }
                                {this.state.user_admin ? (
                                    <Menu.Item className="normal"
                                    name="Создание голосования"
                                    as={Link} to="/New"
                                    
                                >Создание голосования                           
                                </Menu.Item> )                            
                                :null
                                }
                        
                        </Sidebar.Pusher>
                    
                        {this.state.user_registration &&
                        this.state.view_loader === false ? (
                            <Message color="green" info>
                                <Message.Header>Вы орган регистрации.</Message.Header>
                            </Message>
                        ) : null}
                        {this.state.user_admin && this.state.view_loader === false ? (
                            // <ManagerInfoMessage style={{ float: "center"}}/>
                            <Message color="green" Floating >
                                <Message.Header>Вы администратор голосований.</Message.Header>
                                <Message.List>
                                    <Message.Item>
                                        Чтобы создать голосование нажмите "Создать голосование" в боковой панели.
                                    </Message.Item>
                                    <Message.Item>
                                        Чтобы добавить кандидатов в голосование,посетите главную страницу голосования.
                                    </Message.Item>
                                    <Message.Item>
                                        Чтобы расшифровать и опубликовать результаты голосования перейте в нужное уже прошедшее голосование
                                        и введите ваш секретный ключ.
                                    </Message.Item>
                                </Message.List>
                            </Message>
                        ) : null}

                        {this.state.user_registered === false &&
                        this.state.view_loader === false ? (
                            <Message negative>
                                <Message.Header>Вы не зарегистрированы,чтобы проголосовать.</Message.Header>
                                <p>Чтобы зарегистрироваться пройдите в ваш местный орган регистрации.</p>
                            </Message>
                        ) : null}
                        {this.state.redirect ? <Redirect to="/Metamask" /> : null}

                        {this.state.network_error ? (
                            <Redirect to="/Error_Network" />
                        ) : null}

                        {this.state.view_loader ? (
                            <Segment>
                                <Dimmer active inverted>
                                    <Loader>Загрузка</Loader>
                                </Dimmer>
                                <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                            </Segment>
                        ) : null}
                        <Card.Group style={{ marginTop: "0.1em" }}>
                            {this.state.Votings
                                .filter(function(e) {
                                    const time_current = Math.floor(Date.now() / 1000);
                                    switch (chosen_variant) {
                                        case "Прошедшие":
                                            return e.endTime < time_current;
                                        case "Проводятся":
                                            return (
                                                e.time_start < time_current &&
                                                e.endTime > time_current
                                            );
                                        case "Будущие":
                                            return e.time_start > time_current;
                                        default:
                                            return false;
                                    }
                                })
                                .sort(function(a, b) {
                                    if (chosen_variant === "Прошедшие") {
                                        return a.endTime - b.endTime ? -1 : 1; 
                                    } else if (chosen_variant === "Проводятся") {
                                        return a.endTime - b.endTime;
                                    } else {

                                        return a.time_start - b.time_start;
                                    }
                                })
                                .map((Voting, i) => (
                                    <Card fluid color='blue'>
                                    <Card.Content>
                                        <Button                                        
                                            color={
                                                chosen_variant === "Прошедшие"
                                                    ? "blue"
                                                    : chosen_variant === "Проводятся"
                                                    ? this.state.user_registered
                                                        ? Voting.voter_voted
                                                            ? "violet"
                                                            : "green"
                                                        : "blue"
                                                    : "blue"
                                            }
                                            as={Link}
                                            to={`Voting/${Voting.address}`}
                                            floated="right"                       
                                        >
                                            <Button.Content visible>
                                                {chosen_variant === "Прошедшие"
                                                    ? "Посмотреть результаты"
                                                    : chosen_variant === "Проводятся"
                                                    ? this.state.user_registered
                                                        ? Voting.voter_voted
                                                            ? "Изменить голос"
                                                            : "Голосовать"
                                                        : "Посмотреть"
                                                    : "Посмотреть кандидатов"}
                                            </Button.Content>              
                                        </Button>
                                        <Card.Header>{Voting.title}</Card.Header>
                                        <Card.Meta>{Voting.description}</Card.Meta>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <Icon name="clock" />
                                        {chosen_variant === "Прошедшие" ? (
                                            <React.Fragment>
                                                с{" "}
                                                    {this.Convert_to_Timestamp(Voting.time_start)}
                                                {" "}
                                                до{" "}
                                                    {this.Convert_to_Timestamp(Voting.endTime)}
                                            </React.Fragment>
                                        ) : chosen_variant === "Проводятся" ? (
                                            <React.Fragment>
                                                до{" "}
                                                    {this.Convert_to_Timestamp(Voting.endTime)}
                                            </React.Fragment>
                                        ) : (
                                            <React.Fragment>
                                                начало{" "}
                                                    {this.Convert_to_Timestamp(Voting.time_start)}
                                                , до{" "}
                                                    {this.Convert_to_Timestamp(Voting.endTime)}
                                            </React.Fragment>
                                        )}
                                    </Card.Content>
                                </Card>
                                ))}
                    </Card.Group>
                </Container>
               
            
        );
        
    }
}
export default Votings;


