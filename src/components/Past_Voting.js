import React, { Component } from "react";
import {
    Button,
    Table,
    Form,
    Loader,
    Segment,
    Dimmer,
    Image,
    Icon,
    Header
} from "semantic-ui-react";
import Loading_Modal from "./Loading_Modal";
import paillier from "paillier-js";
import BigInt from "big-integer";

class Past_Voting extends Component {
    state = {
        modal_open: false,
        modal_state: "",
        message_error: "",
        message_status:
            "Это займет околы минуты.",
        Admin_voting: "",
        results_p: [],
        privateKey: "",
        privateKey_changed: false,
        input_good: false
    };

    async componentDidMount() {
        this.setState({
            Admin_voting: await this.props.contract.methods
            .Admin()
            .call(),

            results_p: await this.props.contract.methods
                .get_results()
                .call()

        });
        console.log(this.state.results_p);
    };
    

    change = (e, { name, value }) => {
        switch (name) {
            case "privateKey":
                this.setState({ privateKey_changed: true });
                break;
            default:
                break;
        }

        this.setState({ [name]: value }, function() {
            if (this.state.privateKey) {
                this.setState({ input_good: true });
            } else {
                this.setState({ input_good: false });
            }
        });
    };

    decrypt_votes = async event => {
        event.preventDefault();
        this.setState({ modal_open: true, modal_state: "loading" });
        try {
            const privateKey_inputed = JSON.parse(this.state.privateKey);
            const privateKey = new paillier.PrivateKey(
                BigInt(privateKey_inputed.lambda),
                BigInt(privateKey_inputed.mu),
                BigInt(privateKey_inputed._p),
                BigInt(privateKey_inputed._q),
                privateKey_inputed.publicKey
            );
            const publicKey = new paillier.PublicKey(BigInt(privateKey_inputed.publicKey.n),BigInt(privateKey_inputed.publicKey.g));
            const voters = await this.props.contract.methods.get_list_of_voted().call();
            if (voters.length === 0) {
                throw new Error("Голосов не найдено.");
            }
            let encrypted_votes = [];
            for (let i = 0; i < voters.length; i++) {
                encrypted_votes.push(await this.props.contract.methods.get_encrypted_votes(voters[i]).call());
            }
            let results_json = [];
            for (let i = 0; i < encrypted_votes.length; i++) {
                results_json.push(JSON.parse(encrypted_votes[i]));
            }
            let end_results = new Array(this.props.variants.length);
            for (let i = 0; i < results_json.length; i++) {
                for (let j = 0; j < this.props.variants.length; j++) {
                    if (i === 0) {
                        end_results[j] = BigInt(results_json[i][j]);
                    } else {
                        end_results[j] = publicKey.addition(end_results[j],results_json[i][j]);
                    }
                }
            }
            let result_decrypted = new Array(this.props.variants.length);
            for (let i = 0; i < end_results.length; i++) {
                result_decrypted[i] = privateKey.decrypt(end_results[i]);
            }

            const votes_sum = result_decrypted.reduce(
                (a, b) => a + b,
                0
            );
            if (votes_sum !== voters.length) {
                this.setState({ modal_state: "Ошибка", message_error: "Количество подсчитанных голосов не совпадает с количеством проголосовавших." });
            }

            let result_publish = new Array(this.props.variants.length);
            for (let i = 0; i < result_decrypted.length; i++) {
                result_publish[i] = result_decrypted[i].toString();
            }
            console.log(result_publish);
            this.setState({
                message_status: "Публикация результатов"
            });

            await this.props.contract.methods
                .publish_results(result_publish)
                .send({ from: this.props.user_addresses[0] });

            this.setState({ modal_state: "Операция выполнена удачно" });
        } catch (err) {
            console.error(err);
            this.setState({ modal_state: "Ошибка", message_error: err.message });
        }
        console.log(this.state.results_p);
    };
    
    modal_close = () => {
        this.setState({ modal_open: false });
    };

    render() {
        return (
            <React.Fragment>
                <Loading_Modal
                    message_error="Найдена ошибка, попробуйте еще раз."
                    message_success="Результаты голосования расшифрованы и опубликованы."
                    loading_message={this.state.message_status}
                    modal_close={this.modal_close}
                    modal_open={this.state.modal_open}                                      
                    message_error_what={this.state.message_error}
                    modal_state={this.state.modal_state}
                    
                />

                {this.state.Admin_voting === this.props.user_addresses[0] ? (
                    <Form onSubmit={this.decrypt_votes} warning>
                        <Header as="h4" attached="top">
                            Получение реальтатов голосования
                        </Header>
                        <Segment attached>
                            <Form.TextArea
                                label="Секретный ключ"
                                name="privateKey"
                                value={this.state.privateKey}
                                onChange={this.change}
                                error={                                     
                                    this.state.privateKey_changed && !this.state.privateKey
                                }
                                style={{ minHeight: 100 }}
                            />
                            <Button
                                type="submit"
                                fluid
                                loading={this.state.modal_state === "loading"}
                                disabled={!this.state.input_good}
                                color="green"
                            >
                                <Button.Content >
                                    Расшифровать
                                </Button.Content>
                            </Button>
                        </Segment>
                    </Form>
                ) : null}

                <Table celled compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell>Вариант</Table.HeaderCell>
                            <Table.HeaderCell>Описание</Table.HeaderCell>
                            <Table.HeaderCell textAlign="center">
                                Результат
                            </Table.HeaderCell>
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
                                    <Table.Cell textAlign="center">
                                        {this.state.results_p.length !==
                                        0 ? (
                                            this.state.results_p[i]
                                        ) : (
                                            <React.Fragment>
                                                <Icon name="lock" />
                                            </React.Fragment>
                                        )}
                                    </Table.Cell>
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
                </Table>
            </React.Fragment>
        );
    }
}

export default Past_Voting;
