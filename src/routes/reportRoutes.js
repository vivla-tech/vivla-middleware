import express from 'express';
import { getReportListController, getReportByHomeIdController, getReportByUserIdController, getReport2025Controller, getReportData2025ByUserIdController, getReport2026Controller, getReportData2026ByUserIdController } from '../controllers/reportController.js';

const router = express.Router();
router.get('/2024/list', getReportListController);
router.get('/2024/user/:userId', getReportByUserIdController);
router.get('/2025/list', getReport2025Controller);
router.get('/2025/user/:userId', getReportData2025ByUserIdController);
router.get('/2026/list', getReport2026Controller);
router.get('/2026/user/:userId', getReportData2026ByUserIdController);
export default router; 