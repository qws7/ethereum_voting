import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Segment, Message, Icon, Image,Dimmer } from "semantic-ui-react";
import CurrentVoting from "./Current_Voting";
import Information from "./information";
import Web3 from "web3";
import '@metamask/legacy-web3';
import registration from "../build/contracts/registration.json";
import BaseofVotings from "../build/contracts/BaseofVotings.json";
import Voting from "../build/contracts/Voting.json";
import Future_Voting from "./Future_Voting";
import Past_Voting from "./Past_Voting";
import reg_addr from "../Registration_address.json";
import base_addr from "../BaseofVoting_address.json";

class ViewVoting extends Component {
    state = {
        
        view_loader: true,
        user_registered: false,
        type: "Проводятся",
        contract: undefined,
        contract_param: {},
        redirect: false,        
        not_voting: false,
        voted_message_viev: true,
        network_error: false,
    };

    async componentDidMount() {
        await this.get_data();
    }

    async get_data() {
        let web3,contract,registration_organ;
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

            contract = this.get_voting(
                web3,
                this.props.match.params.address
            );

            const user_addresses = await web3.eth.getAccounts();

            const contract_param = {
                address: await contract._address,
                title: await contract.methods.title().call(),
                description: await contract.methods.description().call(),
                time_start: await contract.methods.time_start().call(),
                endTime: await contract.methods.endTime().call(),
                voter_voted: await contract.methods
                    .yetVoted(user_addresses[0])
                    .call(),
                variants: await contract.methods.getParametrs().call(),
                publicKey: await contract.methods.publicKey().call()
            };

            const registered = await registration_organ.methods
                .isVoter(user_addresses[0])
                .call();

            this.setState({
                view_loader: false,
                contract,
                contract_param,
                user_registered: registered,
                user_addresses
            });
        } catch (err) {
            console.error(err);
            if (window.web3 === undefined) {
                this.setState(function(prevState, props) {
                    return { redirect: true };
                });
            } else if (contract === undefined) {
                this.setState(function(prevState, props) {
                    return { not_voting: true };
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

    get_BaseofVotings(web3) {
        const address = base_addr.data;
        const contract = new web3.eth.Contract(BaseofVotings.abi, address);
        return contract;
    }

    get_voting(web3, address) {
        const contract = new web3.eth.Contract(Voting.abi, address);
        return contract;
    }

    metamask_changed = () => {
        window.location.reload();
    };    
    when_voting(time_start, time_end) {
        const time_current = Math.round(Date.now() / 1000);
        try {
            if (time_start > time_current) {
                return "Будущие";
            } else if (time_start < time_current && time_end > time_current) {
                return "Проводятся";
            } else {
                return "Прошедшие";
            }
        } catch {
            return "error";
        }
    }
    dismiss = () => {
        this.setState({ voted_message_viev: false });
    };
    render() {
        const contractStatus = this.when_voting(
            this.state.contract_param.time_start,
            this.state.contract_param.endTime
        );
        return this.state.view_loader ? (
            <Segment loading>
                <Dimmer active inverted>
                    <Image src="https://react.semantic-ui.com/images/wireframe/paragraph.png" />
                </Dimmer>
            </Segment>
        ) : (
            <React.Fragment>
                {this.state.redirect ? <Redirect to="/Metamask" /> : null}

                {this.state.network_error ? (
                    <Redirect to="/Error_Network" />
                ) : null}

                {this.state.not_voting ? <Redirect to="/error" /> : null}

                <Information
                    title={this.state.contract_param.title}
                    description={this.state.contract_param.description}
                    time_start={this.state.contract_param.time_start}
                    endTime={this.state.contract_param.endTime}
                />

                {this.state.contract_param.voter_voted &&
                this.state.voted_message_viev &&
                contractStatus !== "Прошедшие" ? (
                    <Message
                        icon
                        info
                        size="small"
                        onDismiss={this.dismiss}
                    >
                        <Icon name="info" />
                        <Message.Content>
                            <Message.Header>
                                Вы уже голосовали.
                            </Message.Header>
                            Если вы хотетите проголосовать заново,ваш прошлый голос будет удален.
                        </Message.Content>
                    </Message>
                ) : null}

                {contractStatus !== "error" ? (
                    contractStatus === "Прошедшие" ? (
                        <React.Fragment>
                            <Past_Voting
                                variants={this.state.contract_param.variants}
                                contract={this.state.contract}
                                user_addresses={this.state.user_addresses}
                            />
                        </React.Fragment>
                    ) : contractStatus === "Проводятся" ? (
                        <React.Fragment>
                            {!this.state.user_registered ? (
                                <Message negative>
                                    <Message.Header>Вы не зарегистрированы,чтобы проголосовать.</Message.Header>
                                    <p>Чтобы зарегистрироваться пройдите в ваш местный орган регистрации.</p>
                                </Message>
                            ) : null}
                            <CurrentVoting
                                variants={this.state.contract_param.variants}
                                publicKey={this.state.contract_param.publicKey}
                                contract={this.state.contract}
                                user_registered={
                                    this.state.user_registered
                                }
                                user_addresses={this.state.user_addresses}
                            />
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Future_Voting
                                variants={this.state.contract_param.variants}
                                contract={this.state.contract}
                                user_addresses={this.state.user_addresses}
                            />
                        </React.Fragment>
                    )
                ) : null}
            </React.Fragment>
        );
    }
}

export default ViewVoting;
