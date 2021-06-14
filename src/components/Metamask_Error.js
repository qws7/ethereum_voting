import React from "react";
import { Header, Segment, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

export default function Metamask_Error() {
    return (
        <Segment placeholder color="orange">
            <Header icon>
                Измените в MetaMask тестовую сеть на Ropsten.
            </Header>
            <Button as={Link}  to={`/`} color="orange">
                <Button.Content visible>Вернуться на главную страницу</Button.Content>
            </Button>
        </Segment>
    );
}
