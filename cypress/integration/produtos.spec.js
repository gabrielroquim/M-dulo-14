/// <reference types="cypress" />
import contrato from '../Contratos/produtos.contratos'

describe('Teste da Funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })  // vai usar o commands, criei uma variavel tkn , ela vai reeber o token
    });

    it.only('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar Produtos', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            expect(response.body.produtos[1].nome).to.equal('Controle Xbox branco')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos') // nessa linha ele vai validar qualquer item dentro do body com a palavra produtos
            expect(response.duration).to.be.lessThan(15)  // aqui vc garante que o teste nao passe de 15 milissegundos, se psssar de 15 o teeste falha

        })
    });

    it('Cadastrar produto', () => {
        let produto = `Mega Drive ${Math.floor(Math.random() * 100000)}` //esta usando uma funça do javascript para gerar um numero randomico, pois assim podemnos cadastrar varios prodtuso com numeros diferesntes
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto, // vai usar o metodo javascript passado acima
                "preco": 370,
                "descricao": "Console",
                "quantidade": 50
            },
            headers: { authorization: token }

        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })

    });
    // logo abaixo ele vai usar o commands
    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, "Mega Drive", 250, "console", 150)
            .then((response) => {
                expect(response.status).to.equal(400)
                expect(response.body.message).to.equal('Já existe produto com esse nome')
            })
    });
    //aqui ja está passando a URL  pelo cy.request(produtos)
    it('Deve editar um produto ja cadastrado', () => {
        cy.request('produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`, // aqui estamos fazendo uma interpolação
                headers: { authorization: token },
                body:
                {
                    "nome": "Controle Xbox",
                    "preco": 380,
                    "descricao": "Produto Editado 3",
                    "quantidade": 120
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })

    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Mega Drive ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, produto, 158, "Editando produto", 150)
            .then(response => {
                let id = response.body._id

                cy.request({
                    method: 'PUT',
                    url: `produtos/${id}`,
                    headers: { authorization: token },
                    body:
                    {
                        "nome": produto,
                        "preco": 250,
                        "descricao": "Produto Editado cores",
                        "quantidade": 120
                    }
                }).then(response => {
                    expect(response.body.message).to.equal('Registro alterado com sucesso')
                })
            })
    });

    it('Deve deletar um produto cadastrado', () => {
        let produto = `Mega Drive ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, produto, 158, "Editando produto", 150)
        .then(response => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `produtos/${id}`,
                headers: {authorization: token}
            }).then(response => {
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })

        })

    });

});