import React, { Component } from "react";
import { Modal, Icon, Button, Accordion } from "semantic-ui-react";

class Loading_Modal extends Component {
    state = {
        message_error2: false
    };

    error_accordion = () => {
        this.setState(function(prevState, props) {
            return { message_error2: !prevState.message_error2 };
        });
    };

    render() {
        return (
            <Modal
                open={this.props.modal_open}
                closeOnDimmerClick={this.props.modal_state !== "loading"}
                closeOnDocumentClick={this.props.modal_state !== "loading"}
                closeOnEscape={this.props.modal_state !== "loading"}
                onClose={this.props.modal_close}
                size="big"
            >
                <Modal.Header>
                    {this.props.modal_state === "loading" ? (
                        <React.Fragment>
                            <Icon loading name="spinner" /> Обработка
                            
                        </React.Fragment>
                    ) : this.props.modal_state === "error" ? (
                        <React.Fragment>
                            <Icon name="warning sign" /> Ошибка
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Icon name="check" /> Удачно
                        </React.Fragment>
                    )}
                </Modal.Header>
                <Modal.Content>
                    {this.props.modal_state === "loading" ? (
                        this.props.loading_message
                    ) : this.props.modal_state === "error" ? (
                        <Accordion>
                            <Accordion.Title
                                active={this.state.message_error2}
                                onClick={this.error_accordion}
                            >
                                <Icon name="dropdown" />
                                {this.props.message_error}
                            </Accordion.Title>
                            <Accordion.Content
                                active={this.state.message_error2}
                            >
                                <p>{this.props.message_error_what}</p>
                            </Accordion.Content>
                        </Accordion>
                    ) : (
                        this.props.message_success
                    )}
                </Modal.Content>

                {this.props.modal_state === "loading" ? null : (
                    <Modal.Actions>
                        <Button
                            color="green"
                            onClick={this.props.modal_close}
                        >
                            Ок
                        </Button>
                    </Modal.Actions>
                )}
            </Modal>
        );
    }
}

export default Loading_Modal;
