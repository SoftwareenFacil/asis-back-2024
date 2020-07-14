export default function sendMail(info, to, template) {

  var SibApiV3Sdk = require("sib-api-v3-sdk");
  var defaultClient = SibApiV3Sdk.ApiClient.instance;

  // Configure API key authorization: api-key
  var apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey =
    "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";

  // Uncomment below two lines to configure authorization using: partner-key
  // var partnerKey = defaultClient.authentications['partner-key'];
  // partnerKey.apiKey = 'YOUR API KEY';

  var apiInstance = new SibApiV3Sdk.SMTPApi();

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
    to: [
      {
        email: to,
        name: info.RAZON_SOCIAL_CP,
      },
    ],
    templateId: template,
    params: info,
    headers: {
      "X-Mailin-custom":
        "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
    },
  };

  if (to) {
    try {
      apiInstance.sendTransacEmail(sendSmtpEmail).then(
        function (data) {
          console.log("API called successfully. Returned data: " + data);
          //   res.json({ msg: "Correo enviado exitosamente" });
          //   result = "Correo enviado exitosamente";
        },
        function (error) {
          console.error(error);
          //   res.json({ msg: "Ha ocurrido un error", error });
          //   result = `ha ocurrido el siguiente error:${error}`;
        }
      );
      return "Correo Enviado";
    } catch (error) {
        return "ha ocurrido un error";
    }
  } else {
      return "no se ha encontrado correo destinatario"
  }
}
