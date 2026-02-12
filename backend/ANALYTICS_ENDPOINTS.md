# PHASE 1 ANALYTICS ENDPOINTS - Copy to main.py after /doctors endpoint

## File: backend/main.py
## Insert after GET /doctors endpoint (around line 529)

@app.get("/analytics/summary")
async def get_analytics_summary(doctor_id: Optional[int] = Query(None)):
    """Get KPI summary (critical cases, accuracy, total assessments, growth)"""
    try:
        conn = get_db_connection()
        
        # Build query filters
        doctor_filter = f" AND r.doctor_id = {doctor_id}" if doctor_id else ""
        
        # Critical Cases (High Risk)
        critical_query =  "SELECT COUNT(*) FROM records r WHERE r.risk_level = 'High'" + doctor_filter
        critical_cases = conn.execute(critical_query).fetchone()[0]
        
        # Average Accuracy (from model_probability)
        avg_query = "SELECT AVG(r.model_probability) FROM records r WHERE r.model_probability > 0" + doctor_filter
        avg_prob = conn.execute(avg_query).fetchone()[0] or 0.0
        avg_accuracy = round(avg_prob * 100, 1)
        
        # Total Assessments
        total_query = "SELECT COUNT(*) FROM records r WHERE 1=1" + doctor_filter
        total_assessments = conn.execute(total_query).fetchone()[0]
        
        # Monthly Growth
        import datetime
        now = datetime.datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 1:
            start_of_prev_month = now.replace(year=now.year-1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_of_prev_month = now.replace(month=now.month-1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        current_month_query = f"SELECT COUNT(*) FROM records r WHERE r.created_at >= ?{doctor_filter}"
        current_month_count = conn.execute(current_month_query, (start_of_month,)).fetchone()[0]
        
        prev_month_query = f"SELECT COUNT(*) FROM records r WHERE r.created_at >= ? AND r.created_at < ?{doctor_filter}"
        prev_month_count = conn.execute(prev_month_query, (start_of_prev_month, start_of_month)).fetchone()[0]
        
        if prev_month_count > 0:
            growth_rate = ((current_month_count - prev_month_count) / prev_month_count) * 100
            monthly_growth = round(growth_rate, 1)
        else:
            monthly_growth = 0.0
        
        conn.close()
        
        return {
            "critical_cases": critical_cases,
            "avg_accuracy": avg_accuracy,
            "total_assessments": total_assessments,
            "monthly_growth": monthly_growth
        }
    except Exception as e:
        logger.error(f"Analytics summary error: {str(e)}")
        return {
            "critical_cases": 0,
            "avg_accuracy": 0.0,
            "total_assessments": 0,
            "monthly_growth": 0.0
        }

@app.get("/analytics/monthly-trends")
async def get_monthly_trends(doctor_id: Optional[int] = Query(None)):
    """Get monthly assessment trends (YYYY-MM aggregation)"""
    try:
        conn = get_db_connection()
        
        doctor_filter = f" AND doctor_id = {doctor_id}" if doctor_id else ""
        
        query = f"""
            SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as count,
                SUM(CASE WHEN risk_level = 'High' THEN 1 ELSE 0 END) as high_risk
            FROM records
            WHERE 1=1{doctor_filter}
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month DESC
            LIMIT 12
        """
        
        results = conn.execute(query).fetchall()
        conn.close()
        
        return [
            {
                "month": row['month'],
                "count": row['count'],
                "high_risk": row['high_risk']
            }
            for row in reversed(list(results))
        ]
    except Exception as e:
        logger.error(f"Monthly trends error: {str(e)}")
        return []

@app.get("/analytics/risk-distribution")
async def get_risk_distribution(doctor_id: Optional[int] = Query(None)):
    """Get risk level distribution with percentages"""
    try:
        conn = get_db_connection()
        
        doctor_filter = f" AND doctor_id = {doctor_id}" if doctor_id else ""
        
        # Get total count first
        total_query = f"SELECT COUNT(*) FROM records WHERE 1=1{doctor_filter}"
        total = conn.execute(total_query).fetchone()[0]
        
        # Get counts by risk level
        query = f"""
            SELECT risk_level, COUNT(*) as count
            FROM records
            WHERE 1=1{doctor_filter}
            GROUP BY risk_level
        """
        
        results = conn.execute(query).fetchall()
        conn.close()
        
        # Format with percentages
        distribution = []
        for row in results:
            count = row['count']
            percentage = round((count / total * 100), 1) if total > 0 else 0
            distribution.append({
                "level": row['risk_level'],
                "count": count,
                "percentage": percentage
            })
        
        return distribution
    except Exception as e:
        logger.error(f"Risk distribution error: {str(e)}")
        return []

@app.get("/analytics/doctor-performance")
async def get_doctor_performance():
    """Get performance metrics for each doctor"""
    try:
        conn = get_db_connection()
        
        query = """
            SELECT 
                d.id as doctor_id,
                d.name as doctor_name,
                COUNT(r.id) as assessments,
                AVG(r.model_probability) * 100 as avg_confidence,
                SUM(CASE WHEN r.risk_level = 'High' THEN 1 ELSE 0 END) as high_risk_cases
            FROM doctors d
            LEFT JOIN records r ON r.doctor_id = d.id
            GROUP BY d.id, d.name
            ORDER BY assessments DESC
        """
        
        results = conn.execute(query).fetchall()
        conn.close()
        
        return [
            {
                "doctor_id": row['doctor_id'],
                "name": row['doctor_name'],
                "assessments": row['assessments'] or 0,
                "accuracy": round(row['avg_confidence'] or 0.0, 1),
                "high_risk_cases": row['high_risk_cases'] or 0
            }
            for row in results
        ]
    except Exception as e:
        logger.error(f"Doctor performance error: {str(e)}")
        return []
