import statistics
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models import AnalysisResult, ControlData, RiskData, ServiceNowInstance, WidgetConfiguration
from app.schemas.dashboard import (
    ComplianceAnalytics,
    ComplianceGapInsight,
    ControlAnalytics,
    ControlDistributionItem,
    DashboardSummary,
    ExceptionCollection,
    ExceptionItem,
    InstanceAnalytics,
    InstanceOverview,
    RiskPoint,
    TimelineEntry,
)


class DashboardService:
    """Aggregate instance-level metrics for homepage dashboard."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def get_summary(self) -> DashboardSummary:
        instances = self.db.scalars(select(ServiceNowInstance).order_by(ServiceNowInstance.created_at)).all()
        instance_ids = [instance.id for instance in instances]

        if not instance_ids:
            return DashboardSummary(
                total_instances=0,
                active_instances=0,
                total_controls=0,
                total_risks=0,
                total_widgets=0,
                instances=[],
            )

        control_counts = dict(
            self.db.execute(
                select(ControlData.instance_id, func.count(ControlData.id)).where(
                    ControlData.instance_id.in_(instance_ids)
                ).group_by(ControlData.instance_id)
            ).all()
        )

        risk_counts = dict(
            self.db.execute(
                select(RiskData.instance_id, func.count(RiskData.id)).where(RiskData.instance_id.in_(instance_ids)).group_by(
                    RiskData.instance_id
                )
            ).all()
        )

        widget_counts = dict(
            self.db.execute(
                select(WidgetConfiguration.instance_id, func.count(WidgetConfiguration.id))
                .where(WidgetConfiguration.instance_id.in_(instance_ids))
                .group_by(WidgetConfiguration.instance_id)
            ).all()
        )

        latest_analyses_raw = self.db.execute(
            select(
                AnalysisResult.instance_id,
                AnalysisResult.analysis_type,
                AnalysisResult.summary,
                AnalysisResult.generated_at,
            )
            .where(AnalysisResult.instance_id.in_(instance_ids))
            .order_by(AnalysisResult.instance_id, AnalysisResult.generated_at.desc())
        ).all()

        latest_analyses: dict[UUID, dict] = {}
        for row in latest_analyses_raw:
            instance_id, analysis_type, summary_text, generated_at = row
            if instance_id not in latest_analyses:
                latest_analyses[instance_id] = {
                    "analysis_type": analysis_type,
                    "summary": summary_text,
                    "generated_at": generated_at,
                }

        overviews = []
        total_controls = 0
        total_risks = 0
        total_widgets = 0

        for instance in instances:
            controls = control_counts.get(instance.id, 0)
            risks = risk_counts.get(instance.id, 0)
            widgets = widget_counts.get(instance.id, 0)

            total_controls += controls
            total_risks += risks
            total_widgets += widgets

            latest = latest_analyses.get(instance.id)
            overview = InstanceOverview(
                instance_id=instance.id,
                instance_name=instance.instance_name,
                instance_url=instance.instance_url,
                is_active=instance.is_active,
                created_at=instance.created_at,
                updated_at=instance.updated_at,
                control_count=controls,
                risk_count=risks,
                widget_count=widgets,
                latest_analysis_type=latest["analysis_type"] if latest else None,
                latest_analysis_summary=latest["summary"] if latest else None,
                latest_analysis_at=latest["generated_at"] if latest else None,
            )
            overviews.append(overview)

        active_instances = sum(1 for instance in instances if instance.is_active)
        summary = DashboardSummary(
            total_instances=len(instances),
            active_instances=active_instances,
            total_controls=total_controls,
            total_risks=total_risks,
            total_widgets=total_widgets,
            instances=overviews,
        )
        return summary

    def get_instance_analytics(self, instance_id: UUID) -> InstanceAnalytics:
        instance = self.db.get(ServiceNowInstance, instance_id)
        if not instance:
            raise AppError("ServiceNow instance not found.", status_code=404)

        controls = self.db.scalars(select(ControlData).where(ControlData.instance_id == instance_id)).all()
        risks = self.db.scalars(select(RiskData).where(RiskData.instance_id == instance_id)).all()

        def latest_result(analysis_type: str) -> AnalysisResult | None:
            stmt = (
                select(AnalysisResult)
                .where(AnalysisResult.instance_id == instance_id, AnalysisResult.analysis_type == analysis_type)
                .order_by(AnalysisResult.generated_at.desc())
            )
            return self.db.scalars(stmt).first()

        control_result = latest_result("control")
        risk_result = latest_result("risk")
        compliance_result = latest_result("compliance")

        control_distribution: list[ControlDistributionItem] = []
        avg_effectiveness: float | None = None
        if control_result:
            scores = control_result.payload.get("scores", [])
            for item in scores:
                control_distribution.append(
                    ControlDistributionItem(
                        control_id=item.get("control_id", "unknown"),
                        effectiveness=float(item.get("effectiveness", 0)),
                    )
                )
            if scores:
                avg_effectiveness = float(control_result.payload.get("forecast", 0))
        elif controls:
            for control in controls:
                control_distribution.append(
                    ControlDistributionItem(
                        control_id=control.control_id,
                        effectiveness=float(control.attributes.get("effectiveness", 0.5)),
                    )
                )
            if control_distribution:
                avg_effectiveness = statistics.mean(item.effectiveness for item in control_distribution)

        control_analytics = ControlAnalytics(
            total=len(controls),
            average_effectiveness=round(avg_effectiveness, 2) if avg_effectiveness is not None else None,
            distribution=control_distribution[:10],
        )

        risk_points: list[RiskPoint] = []
        if risk_result:
            for insight in risk_result.payload.get("insights", []):
                likelihood = float(insight.get("likelihood", 0))
                impact = float(insight.get("impact", 0))
                score = (likelihood + impact) / 2
                risk_points.append(
                    RiskPoint(
                        risk_id=insight.get("risk_id", "risk"),
                        likelihood=likelihood,
                        impact=impact,
                        score=score,
                    )
                )
        elif risks:
            for risk in risks:
                likelihood = float(risk.attributes.get("likelihood", 0.5))
                impact = float(risk.attributes.get("impact", 0.5))
                risk_points.append(
                    RiskPoint(
                        risk_id=risk.risk_id,
                        likelihood=likelihood,
                        impact=impact,
                        score=(likelihood + impact) / 2,
                    )
                )

        compliance_gaps = []
        if compliance_result:
            compliance_gaps = compliance_result.payload.get("gaps", [])

        healthy = sum(1 for gap in compliance_gaps if gap.get("gap_score", 0) <= 0.3)
        monitor = sum(1 for gap in compliance_gaps if 0.3 < gap.get("gap_score", 0) <= 0.6)
        exception = sum(1 for gap in compliance_gaps if gap.get("gap_score", 0) > 0.6)

        top_gaps = sorted(compliance_gaps, key=lambda g: g.get("gap_score", 0), reverse=True)[:5]
        compliance_analytics = ComplianceAnalytics(
            healthy=healthy,
            monitor=monitor,
            exception=exception,
            top_gaps=[
                ComplianceGapInsight(
                    requirement_id=gap.get("requirement_id", "unknown"),
                    gap_score=float(gap.get("gap_score", 0)),
                    recommendation=gap.get("recommendation", "Review requirement."),
                )
                for gap in top_gaps
            ],
        )

        exception_items: list[ExceptionItem] = []
        for gap in top_gaps:
            gap_score = float(gap.get("gap_score", 0))
            if gap_score <= 0.5:
                continue
            severity = "Critical" if gap_score > 0.75 else "High"
            exception_items.append(
                ExceptionItem(
                    severity=severity,
                    title=f"Compliance gap • {gap.get('requirement_id', 'Requirement')}",
                    description=gap.get("recommendation", "Remediation required."),
                    recommendation="Align evidence and attestations to close the gap.",
                    category="Compliance",
                )
            )

        for risk in risk_points:
            if risk.score <= 0.6:
                continue
            severity = "Critical" if risk.score > 0.8 else "High"
            exception_items.append(
                ExceptionItem(
                    severity=severity,
                    title=f"Risk {risk.risk_id}",
                    description="Elevated risk identified with high likelihood/impact.",
                    recommendation="Prioritize mitigation and control mapping.",
                    category="Risk",
                )
            )

        timeline_results = self.db.scalars(
            select(AnalysisResult)
            .where(AnalysisResult.instance_id == instance_id)
            .order_by(AnalysisResult.generated_at.desc())
            .limit(8)
        ).all()

        timeline = [
            TimelineEntry(
                analysis_type=result.analysis_type,
                summary=result.summary,
                generated_at=result.generated_at,
            )
            for result in timeline_results
        ]

        return InstanceAnalytics(
            instance_id=instance.id,
            instance_name=instance.instance_name,
            controls=control_analytics,
            risks=risk_points,
            compliance=compliance_analytics,
            exceptions=ExceptionCollection(total=len(exception_items), items=exception_items),
            timeline=timeline,
        )
