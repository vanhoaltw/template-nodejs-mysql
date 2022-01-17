/**
 * Created by A on 7/18/17.
 */
"use strict";
const moduleName = 'Stations';
const Manager = require(`../manager/${moduleName}Manager`);
const Joi = require("joi");
const Response = require("../../Common/route/response").setup(Manager);
const CommonFunctions = require('../../Common/CommonFunctions');

const insertSchema = {
  stationsName: Joi.string().required(),
  stationsLogo: Joi.string(),
  stationsHotline: Joi.string(),
  stationsAddress: Joi.string(),
  stationsEmail  :Joi.string().email()
};

const updateSchema = {
  stationsName: Joi.string(),
  stationUrl: Joi.string(),
  stationCheckingAuto: Joi.number(),
  stationsEmail  :Joi.string().email(),
  stationBookingConfig: Joi.array().items({
    index: Joi.number(),
    time: Joi.string(),
    limit:Joi.number()
  }),
  stationCheckingConfig: Joi.array().items({
    stepIndex: Joi.number().required(),
    stepVoice: Joi.string().allow(''),
    stepLabel: Joi.string().required(),
    stepDuration: Joi.number().required(),
    stepVoiceUrl: Joi.string().allow(''),
  }),
  isDeleted: Joi.number(),
  stationStatus: Joi.number(),
  stationsLogo: Joi.string().allow(''),
  stationsColorset: Joi.string().allow(''),
  stationsHotline: Joi.string().allow(''),
  stationsAddress: Joi.string().allow(''),
  stationEnableUseSMS: Joi.number().allow([1,0]),
  stationUseCustomSMTP: Joi.number().allow([1,0]),
  stationCustomSMTPConfig: Joi.string().allow(''),
  stationUseCustomSMSBrand: Joi.number().allow([1,0]),
  stationCustomSMSBrandConfig: Joi.string().allow(''),
  stationEnableUseZNS: Joi.number().allow([1,0]),
  stationEnableUseSMS: Joi.number().allow([1,0]),
  stationUseCustomZNS: Joi.number().allow([1,0]),
  stationCustomZNSConfig: Joi.string().allow(''),
}

const filterSchema = {
  stationsName: Joi.string(),
  stationUrl: Joi.string(),
  isDeleted: Joi.number(),
  stationStatus: Joi.number(),
  stationsEmail  :Joi.string().email()
};

module.exports = {
  insert: {
    tags: ["api", `${moduleName}`],
    description: `insert ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object(insertSchema)
    },
    handler: function (req, res) {
      Response(req, res, "insert");
    }
  },
  updateById: {
    tags: ["api", `${moduleName}`],
    description: `update ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        id: Joi.number().min(0),
        data: Joi.object(updateSchema),
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateById");
    }
  },
  find: {
    tags: ["api", `${moduleName}`],
    description: `update ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        filter: Joi.object(filterSchema),
        skip: Joi.number().default(0).min(0),
        limit: Joi.number().default(20).max(100),
        order: Joi.object({
          key: Joi.string()
            .default("createdAt")
            .allow(""),
          value: Joi.string()
            .default("desc")
            .allow("")
        })
      })
    },
    handler: function (req, res) {
      Response(req, res, "find");
    }
  },
  findById: {
    tags: ["api", `${moduleName}`],
    description: `find by id ${moduleName}`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        id: Joi.number().min(0)
      })
    },
    handler: function (req, res) {
      Response(req, res, "findById");
    }
  },
  findByUrl: {
    tags: ["api", `${moduleName}`],
    description: `find by url ${moduleName}`,
    validate: {
      payload: Joi.object({
        stationsUrl: Joi.string()
      })
    },
    handler: function (req, res) {
      Response(req, res, "findByUrl");
    }
  },
  resetAllDefaultMp3: {
    tags: ["api", `${moduleName}`],
    description: `resetAllDefaultMp3 ${moduleName}`,
    validate: {
    },
    handler: function (req, res) {
      Response(req, res, "resetAllDefaultMp3");
    }
  },

  updateConfigSMS: {
    tags: ["api" ,`${moduleName}`],
    description: `Config SMS`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        smsUrl: Joi.string().required(),
        smsUserName: Joi.string().required(),
        smsPassword: Joi.string().required(),
        smsBrand:Joi.string().required(),
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateConfigSMS");
    }
  },
  updateConfigSMTP: {
    tags: ["api" ,`${moduleName}`],
    description: `Config SMTP`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        smtpHost: Joi.string().required(),
        smtpPort: Joi.number().required(),
        smtpSecure: Joi.string().required(),
        smtpAuth: Joi.object({
          user: Joi.string().required(),
          pass:Joi.string().required()
        }).required(),
        smtpTls:Joi.object({
          rejectUnauthorized: Joi.boolean().required()
        })
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateConfigSMTP");
    }
  },

  updateCustomSMTP: {
    tags: ["api" ,`${moduleName}`],
    description: `CusTom SMTP`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        CustomSMTP: Joi.number().required()
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateCustomSMTP");
    }
  },

  updateCustomSMSBrand: {
    tags: ["api" ,`${moduleName}`],
    description: `CusTom SMTP`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        stationUseCustomSMSBrand: Joi.number().required()
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateCustomSMSBrand");
    }
  },
  enableAdsForStation: {
    tags: ["api" ,`${moduleName}`],
    description: `turn on/off for Ad of station`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        stationsEnableAd: Joi.number().min(0).max(1),
      })
    },
    handler: function (req, res) {
      Response(req, res, "enableAdsForStation");
    }
  },
  updateRightAdBanner: {
    tags: ["api" ,`${moduleName}`],
    description: `update Right Ad Banner`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        stationsCustomAdBannerRight: Joi.string().allow('').required()
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateRightAdBanner");
    }
  },
  updateLeftAdBanner: {
    tags: ["api" ,`${moduleName}`],
    description: `update Left Ad Banner`,
    pre: [{ method: CommonFunctions.verifyToken }],
    auth: {
      strategy: 'jwt',
    },
    validate: {
      headers: Joi.object({
        authorization: Joi.string(),
      }).unknown(),
      payload: Joi.object({
        stationsId: Joi.number().min(0),
        stationsCustomAdBannerLeft: Joi.string().allow('').required()
      })
    },
    handler: function (req, res) {
      Response(req, res, "updateLeftAdBanner");
    }
  },
};
