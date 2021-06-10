import React, { Component } from "react";
import {Table,Loader,Checkbox,Button,Dimmer,Image,Message,Segment,} from "semantic-ui-react";
import Loading_Modal from "./Loading_Modal";
import paillier from "paillier-js";
import BigInt from "big-integer";

class CurrentVoting extends Component {
    state = {
        modal_open: false,
        modal_state: "",
        message_error: "",
        votes_limit: 1,
        choices: []        
    };

    

    vote = async event => {
        this.setState({ modal_open: true, modal_state: "loading" });

        try {
            await this.props.contract.methods
                .vote(this.encrypt_vote())
                .send({ from: this.props.user_addresses[0] });

            this.setState({ modal_state: "success" });
        } catch (err) {
            this.setState({ modal_state: "error", message_error: err.message });
        }
    };
    choice = e => {
        const choices = [...this.state.choices];
        if (e.target.checked) {
            choices.push(e.target.id);
        } else {
            const index = choices.findIndex(v => v === e.target.id);
            choices.splice(index, 1);
        }
        this.setState({ choices });
    };

    encrypt_vote() {
        const publicKey_param = JSON.parse(this.props.publicKey);
        const publicKey = new paillier.PublicKey(
            BigInt(publicKey_param.n),
            BigInt(publicKey_param.g)
        );
        let votes = Array(this.props.variants.length);
        for (let i = 0; i < votes.length; i++) {
            votes[i] = publicKey.encrypt(0).toString();
        }
        this.state.choices.forEach(variant => {
            votes[variant] = publicKey.encrypt(1).toString();
        });
        return JSON.stringify(votes);
    }
    modal_close = () => {
        this.setState({ modal_open: false });
    };
    render() {
        return (
            <React.Fragment>
                <Loading_Modal
                    modal_open={this.state.modal_open}
                    modal_state={this.state.modal_state}
                    modal_close={this.modal_close}
                    message_error_what={this.state.message_error}
                    loading_message="Обычно это занимает 15 секунд.Пожалуйста,дождитесь."
                    message_error="Обнаружена ошибка.Попробуйте еще раз."
                    message_success="Ваш голос принят."
                />

                <Table celled compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell>Название</Table.HeaderCell>
                            <Table.HeaderCell>Описание</Table.HeaderCell>
                            {this.props.user_registered ? (
                                <Table.HeaderCell textAlign="center">
                                    Голос
                                </Table.HeaderCell>
                            ) : null}
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {this.props.variants !== undefined ? (
                            this.props.variants.map((variant, i) => (
                                <Table.Row key={i}>
                                    <Table.Cell>{variant.title}</Table.Cell>
                                    <Table.Cell>
                                        {variant.description}
                                    </Table.Cell>
                                    {this.props.user_registered ? (
                                        <Table.Cell
                                            collapsing
                                            textAlign="center"
                                        >
                                            <Checkbox
                                                slider 
                                                id={i}
                                                onChange={this.choice}
                                            />
                                        </Table.Cell>
                                    ) : null}
                                </Table.Row>
                            ))
                        ) : (
                            <Table.Row>
                                <Table.Cell colSpan="3" textAlign="center">
                                    <Segment>
                                        <Dimmer active inverted>
                                            <Loader inverted>Загрузка</Loader>
                                        </Dimmer>
                                        <Image src="https://react.semantic-ui.com/images/wireframe/short-paragraph.png" />
                                    </Segment>
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>

                    {this.props.user_registered ? (
                        <Table.Footer fullWidth>
                            <Table.Row>
                                <Table.HeaderCell colSpan="2">
                                    {this.state.choices.length === 0 ? (
                                        <Message warning>
                                            Пожалуйста,сделайте выбор.
                                        </Message>
                                    ) : this.state.choices.length >
                                      this.state.votes_limit ? (
                                        <Message negative>
                                            У вас только {this.state.votes_limit}{" "}
                                            {this.state.votes_limit > 1
                                                ? "голосов"
                                                : "голос"}
                                            , а вы выбрали{" "}
                                            {this.state.choices.length}{" "}
                                            .
                                        </Message>
                                    ) : null}
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    <Button
                                        loading={
                                            this.state.modal_state ===
                                            "loading"
                                        }
                                        onClick={this.vote}
                                        color="green"
                                        fluid
                                        disabled={
                                            !(
                                                this.state.choices.length >
                                                    0 &&
                                                this.state.choices.length <=
                                                    this.state.votes_limit
                                            ) ||
                                            !this.props.user_registered
                                        }
                                    >
                                        <Button.Content visible>
                                            Голосовать
                                        </Button.Content>
                                    
                                    </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    ) : null}
                </Table>
            </React.Fragment>
        );
    }
}

export default CurrentVoting;
