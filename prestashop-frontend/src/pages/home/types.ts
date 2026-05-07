export interface ProductReadXML {
  id: number;
  name: {
    language: [
      {
        "#text": string;
      },
    ];
  };
  associations: {
    images: {
      image?: [
        {
          "@_xlink:href": string;
        },
      ];
    };
  };
  price: number;
}

export const LANGUAGE_ID = 0;
