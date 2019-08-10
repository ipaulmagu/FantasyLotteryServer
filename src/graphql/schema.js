const { buildSchema } = require("graphql");

module.exports = {
  HelloWorldSchema: buildSchema(`
  type ParamsType {
    gameid: String
  }

  type LottoData {
    status: Int!
    msg: String!
    params: ParamsType!
    data: String
  }


  type TestData {
      text: String!
        views: Int!
      }

      type RootQuery{
          hello: TestData!
          getLottoData( gameid : String! ): LottoData!
        }   

        schema {
              query: RootQuery
        }
`)

  // LottoSchema: buildSchema(`
  //   type ParamsType {
  //     gameid: String!
  //   }

  //   type LottoData {
  //     status: Int!
  //     msg: String!
  //     params: ParamsType!
  //     data: String!
  //   }

  //   type RootQuery{
  //     getLottoData( gameid : String! ): LottoData!
  //   }

  //   schema {
  //     query: RootQuery
  //   }
  // `)
};
