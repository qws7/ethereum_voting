import '@metamask/legacy-web3';
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { DateTimeInput } from "semantic-ui-calendar-react";
import {Form,Header,Message,Button,Segment,Icon} from "semantic-ui-react";
import paillier from "paillier-js";
import BaseofVotings from "../build/contracts/BaseofVotings.json";
import addresses from "../build/contracts/addresses";
import Web3 from "web3";
import Loading_Modal from "./Loading_Modal";
import FileSaver from "file-saver";



class New_Voting extends Component {
    state = {
        BaseofVotings: undefined,
        Admin: true,
        title: "",
        title_changed: false,
        description: "",
        description_changed: false,
        time_start: "",
        time_startChangedOnce: false,
        endTime: "",
        endTimeChangedOnce: false,
        input_good: false,
        modal_open: false,
        modal_state: "",
        message_error: "",
        generatedKeyPair: false,
        publicKey: {},
        privateKey: {}
    };

    async componentDidMount() {
        await this.loadContract();
        this.generateKeys();
    }

    async loadContract() {
        let web3, BaseofVotings;
        try {
            await window.web3.currentProvider.enable();
            web3 = new Web3(window.web3.currentProvider);
            BaseofVotings = this.get_BaseofVotings(web3);

            window.web3.currentProvider.on(
                "accountsChanged",
                this.metamask_changed
            );
          
            window.web3.currentProvider.on(
                "networkChanged",
                this.metamask_changed
            );

            const user_addresses = await web3.eth.getAccounts();

            if (
                (await BaseofVotings.methods.manager().call()) !==
                user_addresses[0]
            ) {
                this.setState({ Admin: false });
            }

            this.setState({
                BaseofVotings,
                user_addresses
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
    
    generateKeys() {
        const { publicKey, privateKey } =  paillier.generateRandomKeys(2048);
        this.setState({
            publicKey,
            privateKey,
            generatedKeyPair: true
        
    })
    console.log(this.state.privateKey);
    }
    
    
    

    get_BaseofVotings(web3) {
        const address = addresses.BaseofVotings;
        const contract = new web3.eth.Contract(BaseofVotings.abi, address);
        return contract;
    }

    metamask_changed = () => {
        window.location.reload();
    };

    change = (e, { name, value }) => {
        switch (name) {
            case "title":
                this.setState({ title_changed: true });
                break;
            case "description":
                this.setState({ description_changed: true });
                break;
            case "time_start":
                this.setState({ time_startChangedOnce: true });
                break;
            case "endTime":
                this.setState({ endTimeChangedOnce: true });
                break;
            default:
                break;
        }

        this.setState({ [name]: value }, function() {

            if (
                this.state.title &&
                this.state.description &&
                this.state.time_start &&
                this.state.endTime
            ) {
                this.setState({ input_good: true });
            } else {
                this.setState({ input_good: false });
            }
        });
    };
    to_date(time) {
        var year = time.match(/\d\d\d\d/)[0];
        var month = time.match(/.(\d\d)./)[1] - 1;
        var day = time.match(/^\d\d/)[0];
        var hour = time.match(/\s\d\d/)[0];
        var minute = time.match(/:(\d\d)/)[1];
        return Math.round(
            new Date(year, month, day, hour, minute).getTime() / 1000
        );
    }
    submit = async event => {
        event.preventDefault();

        this.setState({ modal_open: true, modal_state: "loading" });

        try {
            await this.state.BaseofVotings.methods
                .createVoting(
                    this.state.title,
                    this.state.description,
                    this.to_date(this.state.time_start),
                    this.to_date(this.state.endTime),
                    JSON.stringify(this.state.publicKey)
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

    save_key = () => {
        let blob = new Blob([JSON.stringify(this.state.privateKey, null, 2)], {
            type: "application/json;charset=utf-8"
        });
        FileSaver.saveAs(blob, "private_key.json");
    };

    render() {
        return (
            <Segment className="p2">
                {this.state.redirect ? <Redirect to="/Metamask" /> : null}

                {this.state.network_error ? (
                    <Redirect to="/Error_Network" />
                ) : null}

                {this.state.Admin ? null : <Redirect to="/" />}

                <Loading_Modal
                    modal_open={this.state.modal_open}
                    modal_state={this.state.modal_state}
                    modal_close={this.modal_close}
                    message_error_what={this.state.message_error}
                    loading_message="Обычно это занимает 15 секунд.Пожалуйста,дождитесь."
                    message_error="Обнаружена ошибка.Попробуте еще раз."
                    message_success="Голосование создано."
                />

                <Header as="h1">Создание голосования</Header>
                <Header as="h3" >
                        Секретный ключ
                    </Header>
                    <Segment attached>
                        
                        <Form.TextArea                          
                            value={
                                this.state.generatedKeyPair
                                    ? JSON.stringify(
                                        (this.state.privateKey),
                                          null,
                                          2
                                      )
                                    : "Дождитесь пока ключи сгенерируются..."
                            }
                            readOnly
                            style={{ minHeight: 300 ,minWidth:1050}}
                        />

                        <Button
                            type="button"
                            icon
                            labelPosition="left"
                            onClick={this.save_key}
                        >
                            <Icon name="save" />
                            Сохранить
                        </Button>
                    </Segment>
                <Form onSubmit={this.submit} warning>
                    <Header as="h4" attached="top">
                        Общая информация
                    </Header>
                    <Segment attached>
                        <Form.Input
                            label="Название"
                            placeholder="Название"
                            name="title"
                            value={this.state.title}
                            onChange={this.change}
                            fluid
                            error={
                                !this.state.title && this.state.title_changed
                            }
                        />
                        <Form.Input
                            label="Описание"
                            placeholder="Описание"
                            name="description"
                            value={this.state.description}
                            onChange={this.change}
                            fluid
                            error={
                                !this.state.description &&
                                this.state.description_changed
                            }
                        />
                        <Form.Group height={2}>
                            <DateTimeInput
                                label="Начало"
                                placeholder="Начало"
                                name="time_start"                               
                                value={this.state.time_start}
                                iconPosition="left"
                                onChange={this.change}
                                dateFormat={"DD.MM.YYYY"}
                                clearable
                                closable
                                hideMobileKeyboard
                                error={
                                    !this.state.time_start &&
                                    this.state.time_startChangedOnce
                                }
                            />
                            <DateTimeInput
                                label="Конец"
                                placeholder="Конец"
                                name="endTime"
                                value={this.state.endTime}
                                iconPosition="left"
                                onChange={this.change}
                                dateFormat={"DD.MM.YYYY"}
                                clearable
                                closable
                                hideMobileKeyboard
                                error={
                                    !this.state.endTime &&
                                    this.state.endTimeChangedOnce
                                }
                            />
                        </Form.Group>
                    </Segment>

                    

                    <Segment vertical>
                        <Button
                            type="submit"
                            fluid
                            loading={this.state.modal_state === "loading"}
                            color="green"
                            disabled={!this.state.input_good}
                        >
                            Создать голосование
                        </Button>
                    </Segment>
                </Form>
            </Segment>
        );
    }
}

export default New_Voting;
