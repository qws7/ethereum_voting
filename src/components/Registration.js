import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import Web3 from "web3";
import '@metamask/legacy-web3';
import registration from "../build/contracts/registration.json";
import Loading_Modal from "./Loading_Modal";
import { connect } from 'react-redux';
import Votings from "./Votings"
import {
    Segment,
    Dimmer,
    Loader,
    Image,
    Table,
    Header,
    Button,
    Input,
    Icon,
    Container
} from "semantic-ui-react";
import reg_addr from "../Registration_address.json";
export class Registration extends Component {
    state = {
        view_loader: true,
        user_registration: false,
        network_error: false,
        voters: [],
        modal_open: false,
        modal_state: "",
        redirect: false,
        pasport: "",
        name: "",
        address: "",
        birthdate: "",
        ethAddress: "",
        message_error: "",
        ethAddress_changed: false,
        input_good: false,
        message_success: ""
    };
    // this.setState({chosen_variant:this.props.data.chosen_variant});

    async componentDidMount() {
        await this.get_data();
    }

    async get_data() {
        let web3, registration_organ;
        try {
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
            registration_organ = this.get_Registration(web3);

            window.web3.currentProvider.on(
                "accountsChanged",
                this.metamask_changed
            );

            window.web3.currentProvider.on(
                "networkChanged",
                this.metamask_changed
            );

            const user_addresses = await web3.eth.getAccounts();

            const registration_organ_admin = await registration_organ.methods
                .Admin()
                .call();
            const user_registration = registration_organ_admin === user_addresses[0];

            const voters = await registration_organ.methods.list_of_registered().call();
            let voter_paraments = [];


            await Promise.all(
                voters.map(async e => {
                    voter_paraments.push(
                        await registration_organ.methods.info_of_registered(e).call()
                    );
                })
            );

            this.setState(function(prevState, props) {
                return {
                    registration_organ,
                    web3,
                    view_loader: false,
                    user_addresses,                    
                    user_registration,
                    voters: voter_paraments
                    
                };
            });
        } catch (err) {
            console.error(err);
            if (window.web3 === undefined) {
                this.setState(function(prevState, props) {
                    return { redirect: true };
                });
            } else {
                this.setState(function(prevState, props) {
                    return { network_error: true };
                });
            }
        }
    }

    get_Registration(web3) {
        const address = reg_addr.data;
        const contract = new web3.eth.Contract(registration.abi, address);
        return contract;
    }

    metamask_changed = () => {
        window.location.reload();
    };

    change = (e, { name, value }) => {
        if (name === "addr") {
            this.setState({ ethAddress_changed: true });
        }

        this.setState({ [name]: value }, function() {
            if (this.state.addr) {
                this.setState({ input_good: true });
            } else {
                this.setState({ input_good: false });
            }
        });
    };

    delete_click = async i => {
        this.setState({ message_success: "Пользователь удален.", modal_open: true, modal_state: "loading" });

        try {
            const address = this.state.voters[i].addr;
            await this.state.registration_organ.methods
                .delete_voter(address)
                .send({ from: this.state.user_addresses[0] });

            this.setState({ modal_state: "success" });
        } catch (err) {
            console.error(err);
            this.setState({ modal_state: "error", message_error: err.message });
        }
    };

    register_click = async e => {
        this.setState({ message_success: "Пользователь зарегистрирован.", modal_open: true, modal_state: "loading" });

        try {
            await this.state.registration_organ.methods
                .register_update(
                    
                    this.state.addr,
                    this.state.pasport,
                    this.state.name,
                    this.state.strAddr,
                    this.state.birth
                   
                )
                .send({ from: this.state.user_addresses[0] });

            this.setState({ modal_state: "success" });
        } catch (err) {
            console.error(err);
            this.setState({ modal_state: "error", message_error: err.message });
        }
    };

    modal_close = () => {
        this.setState({ modal_open: false });
    };
    click_i = (e, { name }) => this.setState({ chosen_variant: name });
    render() {
        return (
           
            <div is="bu">
                <Loading_Modal
                    modal_open={this.state.modal_open}
                    modal_state={this.state.modal_state}
                    modal_close={this.modal_close}
                    message_error_what={this.state.message_error}
                    loading_message="Обычно это занимает 15 секунд.Пожалуйста,дождитесь"
                    message_error="Обнаружена ошибка.Попробуйте еще раз."
                    message_success={this.state.message_success}
                />
                
               
                <Header as="h1">Регистрация</Header>
                {!this.state.view_loader && !this.state.user_registration ? (
                    <Redirect to="/" />
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
                ) : (
                    <Table celled compact unstackable>
                        <Table.Header fullWidth>
                            <Table.Row>
                                <Table.HeaderCell style={{minWidth:150}}>Серия и номер паспорта</Table.HeaderCell>
                                <Table.HeaderCell style={{minWidth:250}}>Фамилия Имя Отчество</Table.HeaderCell>
                                <Table.HeaderCell style={{minWidth:250}}>Адрес</Table.HeaderCell>
                                <Table.HeaderCell style={{minWidth:150}}>Дата рождения</Table.HeaderCell>
                                <Table.HeaderCell >
                                    Ethereum адрес
                                </Table.HeaderCell>
                                <Table.HeaderCell textAlign="center">
                                    Действие
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            <Table.Row>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Серия и номер паспорта"
                                        name="pasport"
                                        value={this.state.pasport}
                                        onChange={this.change}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="ФИО"
                                        name="name"
                                        value={this.state.name}
                                        onChange={this.change}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Адрес"
                                        name="strAddr"
                                        value={this.state.strAddr}
                                        onChange={this.change}
                                        
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Дата рождения"
                                        name="birth"
                                        value={this.state.birth}
                                        onChange={this.change}
                                    />
                                </Table.Cell>
                                <Table.Cell>
                                    <Input
                                        fluid
                                        placeholder="Ethereum адрес"
                                        name="addr"
                                        value={this.state.addr}
                                        onChange={this.change}
                                        error={
                                            !this.state.input_good &&
                                            this.state.ethAddress_changed
                                        }
                                    />
                                </Table.Cell>
                                <Table.Cell textAlign="center">
                                    <Button
                                        positive
                                        disabled={!this.state.input_good}
                                        onClick={this.register_click}
                                    >
                                        <Button.Content >
                                            Зарегистрировать
                                        </Button.Content>
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                            {this.state.voters.length !== 0 ? (
                                this.state.voters.map((voter, i) => (
                                    <Table.Row key={i}>
                                        <Table.Cell>
                                            {voter.pasport}
                                        </Table.Cell>
                                        <Table.Cell>{voter.name}</Table.Cell>
                                        <Table.Cell>
                                            {voter.strAddr}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {voter.birth}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {voter.addr}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            <Button
                                                fluid
                                                negative
                                                onClick={() =>
                                                    this.delete_click(i)
                                                }
                                            >
                                                <Button.Content >
                                                    Удалить
                                                </Button.Content>
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            ) : (
                                <Table.Row>
                                    <Table.Cell colSpan="5" textAlign="center">
                                        <Segment>
                                            
                                                <Loader inverted>
                                                    Загрузка
                                                </Loader>
                                            
                                            <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                                        </Segment>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                )}
             </div>
        );
    }
}

export default Registration;
