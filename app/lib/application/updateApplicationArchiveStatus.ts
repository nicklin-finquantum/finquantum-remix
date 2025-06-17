import ApplicantModel from '~/models/ApplicantModel';
import ApplicationModel from '~/models/ApplicationModel';
import { TargetType } from '~/models/AuditLogModel';
import { OrgRole } from '~/models/OrganizationModel';
import ReportAlertModel from '~/models/ReportAlertModel';
import ReportModel from '~/models/ReportModel';
import { handleError, parseParams, createAuditLog } from '~/utils/utils';

export const updateApplicationArchiveStatus = async (
  req: Request,
  res: Response,
  unarchive = false,
  isDelete = false,
) => {
  let action: string;

  if (isDelete) {
    action = 'Deleting';
  } else if (unarchive) {
    action = 'Unarchiving';
  } else {
    action = 'Archiving';
  }

  try {
    console.log(
      `[INFO] ${action} application for ${req.org?.name} in ${req.product?.name}`,
    );

    const { id } = parseParams(req, ['id']);
    console.log(`Data received: ${JSON.stringify({ id })}`);

    if (isDelete) {
      const updatedApplication = await ApplicationModel.findOneAndUpdate(
        {
          _id: id,
          orgId: req.orgId,
          ...(req.orgRole === OrgRole.ADMIN ? {} : { userId: req.userId }),
          productId: req.productId,
          delete: false,
        },
        { $set: { delete: true } },
        { new: true },
      );

      if (!updatedApplication) {
        return res.status(400).json({
          success: false,
          message: 'Application not found or no permission to delete',
        });
      }

      console.log(`Application deleted: ${updatedApplication}`);

      await ReportModel.updateMany(
        { applicationId: id, delete: false },
        { $set: { delete: true } },
      );
      await ApplicantModel.updateMany(
        { applicationId: id, delete: false },
        { $set: { delete: true } },
      );

      console.log(
        `Associated reports and applicants marked as deleted for application ${id}`,
      );

      return res.status(200).json({ success: true });
    }

    const updatedApplication = await ApplicationModel.findOneAndUpdate(
      {
        _id: id,
        orgId: req.orgId,
        ...(req.orgRole === OrgRole.ADMIN ? {} : { userId: req.userId }),
        productId: req.productId,
        delete: false,
        archive: unarchive,
      },
      {
        $set: { archive: !unarchive, archiveAt: unarchive ? null : Date.now() },
      },
      { new: true },
    );

    if (!updatedApplication) {
      return res.status(400).json({
        success: false,
        message: `Application not found or no permission to ${unarchive ? 'unarchive' : 'archive'
          }`,
      });
    }

    console.log(
      `Application ${unarchive ? 'unarchived' : 'archived'
      }: ${updatedApplication}`,
    );

    await ReportModel.updateMany(
      { applicationId: id, archive: unarchive, delete: false },
      {
        $set: { archive: !unarchive, archiveAt: unarchive ? null : Date.now() },
      },
    );
    await ApplicantModel.updateMany(
      { applicationId: id, archive: unarchive, delete: false },
      {
        $set: { archive: !unarchive, archiveAt: unarchive ? null : Date.now() },
      },
    );

    console.log(
      `Associated reports and applicants marked ${unarchive ? 'unarchived' : 'archived'
      } for application ${id}`,
    );

    if (!unarchive) {
      await ReportAlertModel.deleteMany({ applicationId: id });
      console.log(`Associated report alerts archived for application ${id}`);
    }

    await createAuditLog(
      req.userId,
      `${action}_applicantion`,
      `${action} the applicantion: ${updatedApplication.userApplicationId}`,
      updatedApplication._id,
      TargetType.APPLICATION,
    );

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error(`Error ${action} application:`, err);
    handleError(err, res);
  }
};