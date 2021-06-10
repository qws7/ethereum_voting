import React, { Component } from "react";
import { Header,Segment, Button } from "semantic-ui-react";

class Metamask extends Component {
    click = () => {
        window.open("https://metamask.io/", "_blank");
    };

    render() {
        return (
            <Segment placeholder color="red">
                <Header icon>
                    Чтобы использовать госование необходимо расширение для браузера Metamask. Установите его,пройдя по ссылке.                    
                </Header>
                <Button onClick={this.click} color="red">
                    <Button.Content visible>Установить</Button.Content>
                </Button>
            </Segment>
        );
    }
}

export default Metamask;
