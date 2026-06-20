import { createDailyRecord, type DailyRecord, type DailyRecordType } from '@/lib/day-core/dailyRecordsModel';

export const BANK_CANDIDATE_REVIEW_VERSION = 'bank_candidate_review_v1_47' as const;

export type BankCandidateReviewStatus = 'needs_review' | 'approved' | 'rejected' | 'postponed';

export type BankCandidate = {
  transactionId: string;
  operationDate: string;
  operationTime: string;
  amount: number;
  direction: string;
  movementType: string;
  suggestedCategory: string;
  suggestedSubcategory: string;
  descriptionRedacted: string;
  reviewStatus: BankCandidateReviewStatus;
  importAction: string;
};

export type BankCandidateDecision = {
  transactionId: string;
  status: BankCandidateReviewStatus;
  recordType: DailyRecordType;
  recordTitle: string;
  recordCategory: string;
  amount: number;
  note: string;
  decidedAt: string;
};

export const BANK_CANDIDATE_SAMPLE: BankCandidate[] = [
  {
    "transactionId": "bank_202512_202606_0001",
    "operationDate": "06.06.2026",
    "operationTime": "15:42",
    "amount": -1102.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0002",
    "operationDate": "06.06.2026",
    "operationTime": "15:33",
    "amount": -359.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0003",
    "operationDate": "06.06.2026",
    "operationTime": "00:28",
    "amount": -219.9,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_products",
    "suggestedSubcategory": "groceries",
    "descriptionRedacted": "Оплата в SUPERMARKET SHAMSA Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0004",
    "operationDate": "05.06.2026",
    "operationTime": "14:52",
    "amount": 400.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Перевод с договора [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0005",
    "operationDate": "05.06.2026",
    "operationTime": "14:29",
    "amount": 500.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0006",
    "operationDate": "05.06.2026",
    "operationTime": "12:06",
    "amount": -140.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в VZLET. Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0007",
    "operationDate": "05.06.2026",
    "operationTime": "06:15",
    "amount": 350.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Сбербанк Онлайн",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0008",
    "operationDate": "05.06.2026",
    "operationTime": "05:45",
    "amount": 700.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0009",
    "operationDate": "05.06.2026",
    "operationTime": "05:30",
    "amount": -350.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "work_platform_commission",
    "suggestedSubcategory": "drivee",
    "descriptionRedacted": "Оплата в Drivee YAkutsk RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0010",
    "operationDate": "05.06.2026",
    "operationTime": "04:41",
    "amount": 500.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0011",
    "operationDate": "05.06.2026",
    "operationTime": "02:31",
    "amount": -550.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_products",
    "suggestedSubcategory": "groceries",
    "descriptionRedacted": "Оплата в SP_OVOSHHI FRUKTY Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0012",
    "operationDate": "05.06.2026",
    "operationTime": "02:29",
    "amount": -150.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в UZBEKSKAYA KUKHNYA Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0013",
    "operationDate": "05.06.2026",
    "operationTime": "00:21",
    "amount": -500.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "work_fuel",
    "suggestedSubcategory": "fuel",
    "descriptionRedacted": "Оплата в FILIAL AZS 16 Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0014",
    "operationDate": "04.06.2026",
    "operationTime": "23:08",
    "amount": 1400.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0015",
    "operationDate": "04.06.2026",
    "operationTime": "22:36",
    "amount": -400.0,
    "direction": "expense",
    "movementType": "transfer_out_review",
    "suggestedCategory": "internal_transfer_or_fund",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Внутренний перевод на договор [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0016",
    "operationDate": "04.06.2026",
    "operationTime": "22:22",
    "amount": -185.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0017",
    "operationDate": "04.06.2026",
    "operationTime": "22:14",
    "amount": -350.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "work_platform_commission",
    "suggestedSubcategory": "drivee",
    "descriptionRedacted": "Оплата в Drivee YAkutsk RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0018",
    "operationDate": "04.06.2026",
    "operationTime": "18:53",
    "amount": -125.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0019",
    "operationDate": "04.06.2026",
    "operationTime": "18:29",
    "amount": 750.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0020",
    "operationDate": "04.06.2026",
    "operationTime": "17:49",
    "amount": 500.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Внутрибанковский перевод с договора [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0021",
    "operationDate": "04.06.2026",
    "operationTime": "17:22",
    "amount": -250.0,
    "direction": "expense",
    "movementType": "transfer_out_review",
    "suggestedCategory": "person_to_person",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Внешний перевод по номеру телефона [PHONE]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0022",
    "operationDate": "04.06.2026",
    "operationTime": "16:30",
    "amount": -734.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0023",
    "operationDate": "04.06.2026",
    "operationTime": "15:32",
    "amount": 650.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0024",
    "operationDate": "04.06.2026",
    "operationTime": "15:14",
    "amount": 198.0,
    "direction": "income",
    "movementType": "candidate_income",
    "suggestedCategory": "taxi_or_platform_income",
    "suggestedSubcategory": "organization_sbp",
    "descriptionRedacted": "Перевод средств от организации через СБП ООО РНКО \"Платежный конструктор\"",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0025",
    "operationDate": "04.06.2026",
    "operationTime": "14:49",
    "amount": 400.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0026",
    "operationDate": "04.06.2026",
    "operationTime": "14:24",
    "amount": 800.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Внутрибанковский перевод с договора [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0027",
    "operationDate": "04.06.2026",
    "operationTime": "13:40",
    "amount": -350.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "work_platform_commission",
    "suggestedSubcategory": "drivee",
    "descriptionRedacted": "Оплата в Drivee YAkutsk RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0028",
    "operationDate": "04.06.2026",
    "operationTime": "12:23",
    "amount": 900.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0029",
    "operationDate": "04.06.2026",
    "operationTime": "11:12",
    "amount": -59.99,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в KRASNOE&BELOE Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0030",
    "operationDate": "04.06.2026",
    "operationTime": "11:06",
    "amount": -350.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "work_platform_commission",
    "suggestedSubcategory": "drivee",
    "descriptionRedacted": "Оплата в Drivee YAkutsk RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0031",
    "operationDate": "04.06.2026",
    "operationTime": "09:57",
    "amount": 300.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Внутрибанковский перевод с договора [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0032",
    "operationDate": "04.06.2026",
    "operationTime": "09:24",
    "amount": -200.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в MSO ul. Abelya Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0033",
    "operationDate": "04.06.2026",
    "operationTime": "09:22",
    "amount": -100.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в MSO ul. Abelya Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0034",
    "operationDate": "04.06.2026",
    "operationTime": "09:21",
    "amount": -100.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в MSO ul. Abelya Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0035",
    "operationDate": "04.06.2026",
    "operationTime": "09:18",
    "amount": -100.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в MSO ul. Abelya Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0036",
    "operationDate": "04.06.2026",
    "operationTime": "09:16",
    "amount": -100.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в MSO ul. Abelya Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0037",
    "operationDate": "04.06.2026",
    "operationTime": "09:14",
    "amount": -100.0,
    "direction": "expense",
    "movementType": "expense_review",
    "suggestedCategory": "other",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Оплата в MSO ul. Abelya Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0038",
    "operationDate": "04.06.2026",
    "operationTime": "08:43",
    "amount": 350.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0039",
    "operationDate": "04.06.2026",
    "operationTime": "08:19",
    "amount": -185.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0040",
    "operationDate": "03.06.2026",
    "operationTime": "19:04",
    "amount": -800.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "government_services",
    "suggestedSubcategory": "gosuslugi",
    "descriptionRedacted": "Оплата в GOSUSLUGI EKS g. Sankt-Pete RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0041",
    "operationDate": "03.06.2026",
    "operationTime": "15:30",
    "amount": -39.27,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "entertainment_games",
    "suggestedSubcategory": "games",
    "descriptionRedacted": "Оплата в FUNPAY Moskva RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0042",
    "operationDate": "03.06.2026",
    "operationTime": "15:11",
    "amount": -10.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "entertainment_games",
    "suggestedSubcategory": "games",
    "descriptionRedacted": "Оплата в FUNPAY Moskva RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0043",
    "operationDate": "03.06.2026",
    "operationTime": "14:50",
    "amount": 550.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0044",
    "operationDate": "03.06.2026",
    "operationTime": "14:40",
    "amount": -655.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в NA PYATAKE PENNAYA LIN Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0045",
    "operationDate": "03.06.2026",
    "operationTime": "14:39",
    "amount": 405.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0046",
    "operationDate": "03.06.2026",
    "operationTime": "14:19",
    "amount": 500.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0047",
    "operationDate": "03.06.2026",
    "operationTime": "13:26",
    "amount": 800.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Внутрибанковский перевод с договора [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0048",
    "operationDate": "03.06.2026",
    "operationTime": "10:24",
    "amount": -48.88,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "entertainment_games",
    "suggestedSubcategory": "games",
    "descriptionRedacted": "Оплата в FUNPAY Moskva RU",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0049",
    "operationDate": "03.06.2026",
    "operationTime": "04:02",
    "amount": -15.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0050",
    "operationDate": "02.06.2026",
    "operationTime": "03:00",
    "amount": -15.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "bank_services",
    "suggestedSubcategory": "service_fee",
    "descriptionRedacted": "Плата за пополнение по тарифу",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0051",
    "operationDate": "01.06.2026",
    "operationTime": "18:16",
    "amount": -465.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0052",
    "operationDate": "01.06.2026",
    "operationTime": "14:49",
    "amount": -627.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "entertainment_games",
    "suggestedSubcategory": "games",
    "descriptionRedacted": "Оплата в CYBER PANDA Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0053",
    "operationDate": "01.06.2026",
    "operationTime": "14:49",
    "amount": -627.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "entertainment_games",
    "suggestedSubcategory": "games",
    "descriptionRedacted": "Оплата в CYBER PANDA Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0054",
    "operationDate": "01.06.2026",
    "operationTime": "13:50",
    "amount": -484.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0055",
    "operationDate": "01.06.2026",
    "operationTime": "13:48",
    "amount": -1600.0,
    "direction": "expense",
    "movementType": "transfer_out_review",
    "suggestedCategory": "person_to_person",
    "suggestedSubcategory": "needs_review",
    "descriptionRedacted": "Внешний перевод по номеру телефона [PHONE]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0056",
    "operationDate": "01.06.2026",
    "operationTime": "13:37",
    "amount": 900.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Внесение наличных через банкомат Т-Банк",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0057",
    "operationDate": "01.06.2026",
    "operationTime": "12:42",
    "amount": 600.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Пополнение. Система быстрых платежей",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0058",
    "operationDate": "01.06.2026",
    "operationTime": "12:13",
    "amount": 1000.0,
    "direction": "income",
    "movementType": "incoming_replenishment_review",
    "suggestedCategory": "money_movement_or_income",
    "suggestedSubcategory": "needs_source_review",
    "descriptionRedacted": "Внутрибанковский перевод с договора [CONTRACT]",
    "reviewStatus": "needs_review",
    "importAction": "do_not_count_until_review"
  },
  {
    "transactionId": "bank_202512_202606_0059",
    "operationDate": "01.06.2026",
    "operationTime": "10:48",
    "amount": -299.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "bank_services",
    "suggestedSubcategory": "service_fee",
    "descriptionRedacted": "Оплата услуг T-Bank.T- Bundle",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  },
  {
    "transactionId": "bank_202512_202606_0060",
    "operationDate": "01.06.2026",
    "operationTime": "09:35",
    "amount": -302.0,
    "direction": "expense",
    "movementType": "expense",
    "suggestedCategory": "food_cafe",
    "suggestedSubcategory": "cafe_fastfood",
    "descriptionRedacted": "Оплата в BARAKAT_ Petropavlovsk RUS",
    "reviewStatus": "needs_review",
    "importAction": "review_before_import"
  }
];

export const BANK_CANDIDATE_TOTAL_COUNT = 2766 as const;

export const BANK_CANDIDATE_CATEGORY_COUNTS: Record<string, number> = {
  "food_cafe": 226,
  "food_products": 144,
  "money_movement_or_income": 1119,
  "other": 411,
  "work_platform_commission": 316,
  "work_fuel": 183,
  "internal_transfer_or_fund": 119,
  "person_to_person": 128,
  "taxi_or_platform_income": 1,
  "government_services": 1,
  "entertainment_games": 54,
  "bank_services": 11,
  "vehicle_parts_service": 19,
  "leisure_relationship": 7,
  "communication": 10,
  "shopping_gifts_clothes": 2,
  "income_or_transfer": 15
};

export const BANK_CANDIDATE_STATUS_COUNTS: Record<string, number> = {
  "needs_review": 2766
};

export type BankCandidateFilterId = 'all' | 'expense' | 'income' | 'fuel' | 'food' | 'drivee' | 'car' | 'transfers' | 'approved' | 'rejected' | 'postponed';

export const BANK_CANDIDATE_FILTERS: { id: BankCandidateFilterId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'expense', label: 'Расходы' },
  { id: 'income', label: 'Доходы' },
  { id: 'fuel', label: 'Бензин' },
  { id: 'food', label: 'Еда/продукты' },
  { id: 'drivee', label: 'Drivee' },
  { id: 'car', label: 'Машина' },
  { id: 'transfers', label: 'Переводы' },
  { id: 'approved', label: 'Подтверждённые' },
  { id: 'rejected', label: 'Отклонённые' },
  { id: 'postponed', label: 'Позже' }
];

export function filterBankCandidates(candidates: BankCandidate[], decisions: BankCandidateDecision[], filter: BankCandidateFilterId): BankCandidate[] {
  if (filter === 'all') return candidates;
  if (filter === 'approved' || filter === 'rejected' || filter === 'postponed') {
    return candidates.filter(candidate => getBankDecision(candidate, decisions).status === filter);
  }
  if (filter === 'expense') return candidates.filter(candidate => candidate.direction === 'expense');
  if (filter === 'income') return candidates.filter(candidate => candidate.direction === 'income');
  if (filter === 'fuel') return candidates.filter(candidate => candidate.suggestedCategory === 'work_fuel');
  if (filter === 'food') return candidates.filter(candidate => candidate.suggestedCategory === 'food_cafe' || candidate.suggestedCategory === 'food_products');
  if (filter === 'drivee') return candidates.filter(candidate => candidate.suggestedCategory === 'work_platform_commission');
  if (filter === 'car') return candidates.filter(candidate => candidate.suggestedCategory === 'vehicle_parts_service');
  if (filter === 'transfers') return candidates.filter(candidate => candidate.suggestedCategory === 'person_to_person' || candidate.suggestedCategory === 'internal_transfer_or_fund' || candidate.suggestedCategory === 'money_movement_or_income');
  return candidates;
}

export function paginateBankCandidates(candidates: BankCandidate[], page: number, pageSize: number): BankCandidate[] {
  const safePage = Math.max(0, page);
  const safeSize = Math.max(1, pageSize);
  return candidates.slice(safePage * safeSize, safePage * safeSize + safeSize);
}

export function getBankCandidatePageCount(candidates: BankCandidate[], pageSize: number) {
  return Math.max(1, Math.ceil(candidates.length / Math.max(1, pageSize)));
}

export function mapBankCategoryToRecordType(candidate: BankCandidate): DailyRecordType {
  if (candidate.direction === 'income') return 'income';
  if (candidate.suggestedCategory === 'work_fuel') return 'fuel';
  if (candidate.suggestedCategory === 'work_platform_commission') return 'drivee_topup';
  return 'expense';
}

export function mapBankCategoryToRecordCategory(candidate: BankCandidate) {
  const categoryMap: Record<string, string> = {
    work_fuel: 'fuel',
    work_platform_commission: 'drivee_topup',
    food_cafe: 'food',
    food_products: 'products',
    vehicle_parts_service: 'car',
    leisure_relationship: 'meeting',
    entertainment_games: 'entertainment',
    shopping_gifts_clothes: 'shopping',
    communication: 'communication',
    bank_services: 'bank_services',
    income_or_transfer: 'income_or_transfer',
    taxi_or_platform_income: 'taxi',
    person_to_person: 'person_to_person',
    internal_transfer_or_fund: 'review_transfer',
    other: 'other'
  };
  return categoryMap[candidate.suggestedCategory] ?? candidate.suggestedCategory ?? 'other';
}

export function buildDefaultBankDecision(candidate: BankCandidate): BankCandidateDecision {
  const recordType = mapBankCategoryToRecordType(candidate);
  const amount = Math.abs(Math.round(candidate.amount));
  return {
    transactionId: candidate.transactionId,
    status: 'needs_review',
    recordType,
    recordTitle: buildRecordTitle(candidate),
    recordCategory: mapBankCategoryToRecordCategory(candidate),
    amount,
    note: `Банк-кандидат ${candidate.transactionId}: ${candidate.descriptionRedacted}`,
    decidedAt: new Date().toISOString()
  };
}

export function approveBankCandidateAsRecord(candidate: BankCandidate, decision: BankCandidateDecision): DailyRecord {
  return createDailyRecord({
    type: decision.recordType,
    title: decision.recordTitle,
    amount: decision.amount,
    category: decision.recordCategory,
    note: `Подтверждено из банковского review: ${candidate.transactionId}. ${decision.note}`,
    source: 'import_review_queue'
  });
}

export function updateBankDecision(
  decisions: BankCandidateDecision[],
  transactionId: string,
  patch: Partial<BankCandidateDecision>
): BankCandidateDecision[] {
  const exists = decisions.some(decision => decision.transactionId === transactionId);
  if (!exists) {
    const candidate = BANK_CANDIDATE_SAMPLE.find(item => item.transactionId === transactionId);
    if (!candidate) return decisions;
    return [...decisions, { ...buildDefaultBankDecision(candidate), ...patch, decidedAt: new Date().toISOString() }];
  }
  return decisions.map(decision => decision.transactionId === transactionId
    ? { ...decision, ...patch, decidedAt: new Date().toISOString() }
    : decision
  );
}

export function getBankDecision(candidate: BankCandidate, decisions: BankCandidateDecision[]) {
  return decisions.find(decision => decision.transactionId === candidate.transactionId) ?? buildDefaultBankDecision(candidate);
}

function buildRecordTitle(candidate: BankCandidate) {
  if (candidate.suggestedCategory === 'work_fuel') return 'Заправка';
  if (candidate.suggestedCategory === 'food_cafe') return 'Еда / кафе';
  if (candidate.suggestedCategory === 'food_products') return 'Продукты';
  if (candidate.suggestedCategory === 'vehicle_parts_service') return 'Машина';
  if (candidate.suggestedCategory === 'work_platform_commission') return 'Drivee / комиссия';
  if (candidate.direction === 'income') return 'Доход из банка';
  return candidate.suggestedCategory || 'Банковская операция';
}
