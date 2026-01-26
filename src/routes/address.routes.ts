import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();
const addressController = new AddressController();

router.use(protect);

router.post('/', addressController.addAddress);
router.get('/', addressController.getAddresses);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;
