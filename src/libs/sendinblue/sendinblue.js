import { API_KEY_SENDINBLUE } from "../../constant/var";

export default function sendMail(toSend, template, info) {
  var SibApiV3Sdk = require('sib-api-v3-sdk');
  var defaultClient = SibApiV3Sdk.ApiClient.instance;

  // Configure API key authorization: api-key
  var apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = API_KEY_SENDINBLUE;

  // Uncomment below two lines to configure authorization using: partner-key
  // var partnerKey = defaultClient.authentications['partner-key'];
  // partnerKey.apiKey = 'YOUR API KEY';

  var apiInstance = new SibApiV3Sdk.SMTPApi();

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
    to: toSend,
    templateId: template,
    params: info,
    headers: {
      'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    }
  };

  apiInstance.sendTransacEmail(sendSmtpEmail)
  .then(function (data) {
    console.log('Email enviado correctamente', data);
  }, function (error) {
    console.error(error);
  });

  //++++++++++++++++++++++++++++++ COMO ENVIAR EL CORREO
  // sendMail(
  //   [
  //     {
  //       email: userCreatorOfClaim.email_primario,
  //       name: userCreatorOfClaim.razon_social || '',
  //     }
  //   ],
  //   SB_TEMPLATE_ID_APPROVAL_REJECTION_RESPONSE,
  //   {
  //     CODIGO_RECLAMO: claim.code || '',
  //     NOMBRE_RESPONSABLE: claim.assignmentData.responsiblePerson.name || '',
  //     APELLIDO_RESPONSABLE: '',
  //     APROBADO_RECHAZADO_RECLAMO: data.status || 'Sin Información',
  //     RUT_DENUNCIANTE: claim.complainantData.complainantPerson.rut || '',
  //     NOMBRE_DENUNCIANTE: claim.complainantData.complainantPerson.name || '',
  //     FECHA_INICIO_REC: claim.registrationData.date || '',
  //     HORA_INICIO_REC: claim.registrationData.time || '',
  //     TITULO_REC: claim.registrationData.title || '',
  //     TIPO_REC: claim.assignmentData.responsiblePerson.claimType || '',
  //     TIPO_CAUSANTE_REC: claim.assignmentData.responsiblePerson.causerType || '',
  //     LOCALIDAD: claim.registrationData.locality || '',
  //     COMUNA: claim.registrationData.commune || '',
  //     INFRA_RECLAMO: claim.assignmentData.responsiblePerson.operationalInfrastructure || '',
  //     UNIDAD_OPE_RECLAMO: claim.assignmentData.responsiblePerson.operationalUnit || '',
  //     ZONA_RECLAMO: claim.assignmentData.responsiblePerson.zone || '',
  //     SECTOR_RECLAMO: claim.assignmentData.responsiblePerson.sector || '',
  //     COMENTARIO_RESPUESTA: data.statusComment || '',
  //     CREADOR: userCreatorOfClaim.interestGroupInfo.bussinesName || '',
  //     CARGO_CREADOR: userCreatorOfClaim.interestGroupInfo.charge || '',
  //     EMAIL_CREADOR: userCreatorOfClaim.interestGroupInfo.primaryEmail || '',
  //     TELEFONO_CREADOR: userCreatorOfClaim.interestGroupInfo.primaryContact || ''
  //   }
  // );
};