import React, { Component } from "react";
import {Segment,Loader,Form,Table,Dimmer,Image,Button,Header} from "semantic-ui-react";
import Loading_Modal from "./Loading_Modal";

class Future_Voting extends Component {
    state = {
        modal_open: false,
        modal_state: "",
        message_error: "",        
        title: "",
        title_changed: false,
        description: "",
        description_changed: false,
        Admin_voting: "",
        input_good: false
    };

    async componentDidMount() {
        this.setState({
            Admin_voting: await this.props.contract.methods
                .Admin()
                .call()
        });
    }

    change = (e, { name, value }) => {
        switch (name) {
            case "title":
                this.setState({ title_changed: true });
                break;
            case "description":
                this.setState({ description_changed: true });
                break;
            default:
                break;
        }

        this.setState({ [name]: value }, function() {
            if (this.state.title && this.state.description) {
                this.setState({ input_good: true });
            } else {
                this.setState({ input_good: false });
            }
        });
    };

    submit = async event => {
        event.preventDefault();

        this.setState({ modal_open: true, modal_state: "loading" });

        try {
            await this.props.contract.methods
                .add_param(this.state.title, this.state.description)
                .send({ from: this.props.user_addresses[0] });

            this.setState({ modal_state: "success" });
        } catch (err) {
            this.setState({ modal_state: "error", message_error: err.message });
        }
    };

    modal_close = () => {
        this.setState({ modal_open: false });
    };

    render() {
        return (
            <React.Fragment>
                <Loading_Modal
                    loading_message="Обычно это занимает 15 секунд.Пожалуйста,дождитесь."
                    message_error="Обнаружена ошибка.Попробуйте еще раз."
                    message_success="Опция добавлена."
                    modal_open={this.state.modal_open}
                    modal_state={this.state.modal_state}
                    modal_close={this.modal_close}
                    message_error_what={this.state.message_error}
                    
                    
                    
                />

                {this.state.Admin_voting === this.props.user_addresses[0] ? (
                    <Form onSubmit={this.submit} warning>
                        <Header as="h4" attached="top">
                            Добавить вариант
                        </Header>
                        <Segment attached>
                            <Form.Group widths="equal">
                                <Form.Input
                                    placeholder="Название"
                                    name="title"
                                    width="7"
                                    fluid                                    
                                    value={this.state.title}
                                    onChange={this.change}
                                    error={
                                        !this.state.title &&
                                        this.state.title_changed
                                    }
                                />
                                <Form.Input
                                    placeholder="Описание"
                                    width="7"
                                    fluid
                                    name="description"                                   
                                    value={this.state.description}
                                    onChange={this.change}
                                    error={
                                        !this.state.description &&
                                        this.state.description_changed
                                    }
                                />
                                <Form.Button
                                    width="2"
                                    fluid
                                    type="submit"
                                    loading={
                                        this.state.modal_state === "loading"
                                    }
                                    color="green"
                                    disabled={!this.state.input_good}
                                >
                                    <Button.Content visible>Добавить</Button.Content>
                                </Form.Button>
                            </Form.Group>
                        </Segment>
                    </Form>
                ) : null}

                <Table celled compact unstackable>
                    <Table.Header fullWidth>
                        <Table.Row>
                            <Table.HeaderCell>Название</Table.HeaderCell>
                            <Table.HeaderCell>Описание</Table.HeaderCell>
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

export default Future_Voting;
